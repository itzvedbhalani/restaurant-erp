import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Returns notifications visible to the requesting user.
   * - SUPER_ADMIN can see every notification across every user/restaurant
   *   (platform-wide oversight).
   * - Every other role only ever sees notifications addressed to them.
   */
  async findForUser(userId: string, role: string) {
    if (role === 'SUPER_ADMIN') {
      return this.prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 200,
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      });
    }

    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async markAsRead(id: string, userId: string, role: string) {
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif) return null;

    // Users may only mark their own notifications as read; Super Admin may
    // mark any notification as read since they can see all of them.
    if (notif.userId !== userId && role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('You cannot modify another user\'s notification');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string, role: string) {
    if (role === 'SUPER_ADMIN') {
      return this.prisma.notification.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });
    }

    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
