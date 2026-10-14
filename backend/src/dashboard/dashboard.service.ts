import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSuperAdminStats() {
    // These six queries don't depend on each other, so run them together
    // instead of one at a time.
    const [restaurantsCount, usersCount, ordersCount, activeComplaintsCount, recentLogs, restaurantsList] =
      await Promise.all([
        this.prisma.restaurant.count(),
        this.prisma.user.count(),
        this.prisma.order.count(),
        this.prisma.complaint.count({
          where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
        }),
        this.prisma.auditLog.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, role: { select: { name: true } } } },
          },
        }),
        this.prisma.restaurant.findMany({
          include: {
            _count: {
              select: { staff: true, tables: true, orders: true },
            },
          },
        }),
      ]);

    return {
      restaurantsCount,
      usersCount,
      ordersCount,
      activeComplaintsCount,
      recentLogs,
      restaurantsList,
    };
  }

  async getOwnerStats(restaurantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    // The single query below needs to cover both "since start of month"
    // (for monthly sales) and "last 7 days" (for the chart) — so fetch
    // from whichever of those two dates is earlier.
    const earliestNeeded = sevenDaysAgo < firstDayOfMonth ? sevenDaysAgo : firstDayOfMonth;

    // Every query below is independent of the others, so they're fired
    // together instead of one-at-a-time — this alone cuts the round-trip
    // time roughly 5x on every dashboard load. The previous version also
    // ran a *separate* query per day for the weekly chart (7 extra
    // round trips); that's now folded into the single `windowOrders`
    // fetch below and grouped by day in memory instead.
    const [windowOrders, totalStaff, clockedInStaff, lowStockItems, activeComplaintsCount] =
      await Promise.all([
        this.prisma.order.findMany({
          where: {
            restaurantId,
            status: 'COMPLETED',
            createdAt: { gte: earliestNeeded },
          },
          select: { totalPrice: true, createdAt: true },
        }),
        this.prisma.staff.count({ where: { restaurantId } }),
        this.prisma.attendance.count({
          where: { staff: { restaurantId }, date: today },
        }),
        this.prisma.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*) as count FROM inventory_items
          WHERE restaurant_id = ${restaurantId} AND quantity <= threshold
        `,
        this.prisma.complaint.count({
          where: {
            reporter: { staff: { restaurantId } },
            status: { in: ['OPEN', 'IN_PROGRESS'] },
          },
        }),
      ]);

    const lowStockCount = Number(lowStockItems[0]?.count ?? 0);

    // Today's sales/profit
    const todayOrders = windowOrders.filter((o) => o.createdAt >= today);
    const todaySales = todayOrders.reduce((acc, curr) => acc + curr.totalPrice, 0);
    const todayProfit = todaySales * 0.65; // Simulated 65% profit margin

    // Monthly sales/profit
    const monthlyOrders = windowOrders.filter((o) => o.createdAt >= firstDayOfMonth);
    const monthlySales = monthlyOrders.reduce((acc, curr) => acc + curr.totalPrice, 0);
    const monthlyProfit = monthlySales * 0.65;

    // Chart data (past 7 days sales), grouped from the single fetch above
    // instead of one query per day.
    const weeklySales = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const daySalesSum = windowOrders
        .filter((o) => o.createdAt >= date && o.createdAt < nextDate)
        .reduce((acc, curr) => acc + curr.totalPrice, 0);

      weeklySales.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        sales: daySalesSum,
        profit: daySalesSum * 0.65,
      });
    }

    return {
      todaySales,
      todayProfit,
      monthlySales,
      monthlyProfit,
      totalStaff,
      attendanceSummary: `${clockedInStaff}/${totalStaff} Staff Present`,
      lowStockCount,
      activeComplaintsCount,
      weeklySales,
    };
  }

  /**
   * Powers the Reports & Analytics page: best-selling items, staff
   * performance, and a daily sales trend, all scoped to a custom date
   * range instead of the fixed "today / this month" the main dashboard
   * uses.
   */
  async getReports(restaurantId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 29));
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const orders = await this.prisma.order.findMany({
      where: {
        restaurantId,
        status: 'COMPLETED',
        createdAt: { gte: start, lte: end },
      },
      include: {
        orderItems: { include: { menuItem: true } },
      },
    });

    // Order.waiterId is a plain scalar field with no relation defined, so
    // waiter names are looked up separately rather than via `include`.
    const waiterIds = Array.from(new Set(orders.map((o) => o.waiterId).filter((id): id is string => !!id)));
    const waiters = waiterIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: waiterIds } },
          select: { id: true, name: true },
        })
      : [];
    const waiterNameById = new Map<string, string>(waiters.map((w) => [w.id, w.name]));

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Best-selling items
    const itemStatsMap = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const order of orders) {
      for (const item of order.orderItems) {
        const key = item.menuItemId;
        const existing = itemStatsMap.get(key) || { name: item.menuItem.name, qty: 0, revenue: 0 };
        existing.qty += item.quantity;
        existing.revenue += item.price * item.quantity;
        itemStatsMap.set(key, existing);
      }
    }
    const bestSellers = Array.from(itemStatsMap.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    // Staff (waiter) performance
    const staffStatsMap = new Map<string, { name: string; orders: number; revenue: number }>();
    for (const order of orders) {
      if (!order.waiterId) continue;
      const key = order.waiterId;
      const existing = staffStatsMap.get(key) || { name: waiterNameById.get(key) || 'Unknown', orders: 0, revenue: 0 };
      existing.orders += 1;
      existing.revenue += order.totalPrice;
      staffStatsMap.set(key, existing);
    }
    const staffPerformance = Array.from(staffStatsMap.values()).sort((a, b) => b.revenue - a.revenue);

    // Daily sales trend across the selected range
    const dayMap = new Map<string, number>();
    for (const order of orders) {
      const dayKey = order.createdAt.toISOString().slice(0, 10);
      dayMap.set(dayKey, (dayMap.get(dayKey) || 0) + order.totalPrice);
    }
    const salesTrend = Array.from(dayMap.entries())
      .map(([date, sales]) => ({ date, sales }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      rangeStart: start,
      rangeEnd: end,
      totalRevenue,
      totalOrders,
      avgOrderValue,
      bestSellers,
      staffPerformance,
      salesTrend,
    };
  }
}
