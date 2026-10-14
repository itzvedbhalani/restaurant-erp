import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const SESSION_MINUTES = 5;
const COOLDOWN_DAYS = 3;
const DEMO_ROLES = ['OWNER', 'WAITER', 'CASHIER', 'KITCHEN'];

@Injectable()
export class DemoService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Issues (or re-issues) a Quick Login demo session for a given device +
   * role. Each device+role pair gets its own private demo restaurant —
   * never shared with other visitors — so nobody's exploring ever disturbs
   * anyone else's. Sessions last SESSION_MINUTES; a device can only be
   * granted a brand-new demo restaurant once every COOLDOWN_DAYS, though
   * revisiting mid-session just logs them back into the same one.
   */
  async quickLogin(deviceId: string, roleName: string) {
    const role = roleName.toUpperCase();
    if (!DEMO_ROLES.includes(role)) {
      throw new BadRequestException(`Demo login is only available for: ${DEMO_ROLES.join(', ')}`);
    }
    if (!deviceId || deviceId.length < 8) {
      throw new BadRequestException('A valid deviceId is required');
    }

    const existing = await this.prisma.demoSession.findUnique({
      where: { deviceId_roleName: { deviceId, roleName: role } },
    });

    const now = new Date();

    if (existing) {
      if (existing.expiresAt > now) {
        // Still within their 5-minute window — just log back into the same demo.
        return this.issueTokenForExistingSession(existing);
      }

      const cooldownEnds = new Date(existing.issuedAt.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
      if (cooldownEnds > now) {
        const hoursLeft = Math.ceil((cooldownEnds.getTime() - now.getTime()) / (60 * 60 * 1000));
        throw new ForbiddenException(
          `Your demo session has ended. You can start a new one in about ${hoursLeft} hour(s).`,
        );
      }

      // Cooldown has passed — tear down the old demo restaurant entirely
      // and issue a brand new one.
      await this.teardownDemo(existing.restaurantId);
      await this.prisma.demoSession.delete({ where: { id: existing.id } });
    }

    return this.createFreshDemoSession(deviceId, role);
  }

  private async issueTokenForExistingSession(session: { restaurantId: string; userId: string; expiresAt: Date }) {
    const user = await this.prisma.user.findUnique({
      where: { id: session.userId },
      include: { role: true, staff: true },
    });
    if (!user) {
      // Shouldn't happen, but fail safe by treating it as no session.
      throw new BadRequestException('Demo session data is missing. Please try again.');
    }

    const secondsLeft = Math.max(1, Math.floor((session.expiresAt.getTime() - Date.now()) / 1000));
    return this.buildResponse(user, session.expiresAt, secondsLeft);
  }

  private async createFreshDemoSession(deviceId: string, role: string) {
    let demoRole = await this.prisma.role.findUnique({ where: { name: role } });
    if (!demoRole) {
      demoRole = await this.prisma.role.create({ data: { name: role, description: `${role} (demo)` } });
    }

    const suffix = crypto.randomBytes(3).toString('hex');
    const hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);
    const expiresAt = new Date(Date.now() + SESSION_MINUTES * 60 * 1000);

    const { restaurant, user } = await this.prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.create({
        data: {
          name: `Demo Restaurant ${suffix}`,
          address: '123 Demo Street',
          phone: '0000000000',
          status: 'ACTIVE',
          isDemo: true,
        },
      });

      const user = await tx.user.create({
        data: {
          email: `demo.${role.toLowerCase()}.${suffix}@demo.local`,
          password: hashedPassword,
          name: `Demo ${role.charAt(0)}${role.slice(1).toLowerCase()}`,
          roleId: demoRole.id,
          isVerified: true,
        },
      });

      await tx.staff.create({
        data: {
          userId: user.id,
          restaurantId: restaurant.id,
          phone: '0000000000',
          salary: 0,
          status: 'ACTIVE',
        },
      });

      // Seed a small set of sample data so the demo isn't empty.
      const category = await tx.menuCategory.create({
        data: { name: 'Starters', restaurantId: restaurant.id },
      });
      await tx.menuItem.create({
        data: { name: 'Garlic Bread', price: 149, categoryId: category.id },
      });
      await tx.menuItem.create({
        data: { name: 'Paneer Tikka', price: 249, categoryId: category.id },
      });
      const mainsCategory = await tx.menuCategory.create({
        data: { name: 'Main Course', restaurantId: restaurant.id },
      });
      await tx.menuItem.create({
        data: { name: 'Butter Chicken', price: 399, categoryId: mainsCategory.id },
      });

      await tx.table.create({
        data: { number: '1', capacity: 4, restaurantId: restaurant.id, status: 'AVAILABLE' },
      });
      await tx.table.create({
        data: { number: '2', capacity: 2, restaurantId: restaurant.id, status: 'AVAILABLE' },
      });

      return { restaurant, user };
    });

    await this.prisma.demoSession.create({
      data: {
        deviceId,
        roleName: role,
        restaurantId: restaurant.id,
        userId: user.id,
        expiresAt,
      },
    });

    const fullUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { role: true, staff: true },
    });

    return this.buildResponse(fullUser, expiresAt, SESSION_MINUTES * 60);
  }

  private buildResponse(user: any, expiresAt: Date, secondsRemaining: number) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name,
      restaurantId: user.staff?.restaurantId || null,
      staffId: user.staff?.id || null,
      isDemo: true,
    };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: `${secondsRemaining}s` }),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
        restaurantId: user.staff?.restaurantId || null,
        staffId: user.staff?.id || null,
      },
      isDemo: true,
      demoExpiresAt: expiresAt.toISOString(),
      secondsRemaining,
    };
  }

  private async teardownDemo(restaurantId: string) {
    // Restaurant's relations cascade for most tables (menu, inventory,
    // suppliers, tables, settings) — but NOT for Order (deliberately, to
    // protect real restaurants from accidental data loss) and NOT for Staff
    // either (Staff.restaurant has no onDelete: Cascade in the schema).
    // Deleting the restaurant before clearing these would throw a foreign
    // key violation and silently leave the demo restaurant orphaned
    // forever. Order first, then the User (whose delete cascades to Staff
    // via User -> Staff's onDelete: Cascade), then finally the restaurant.
    await this.prisma.order.deleteMany({ where: { restaurantId } });

    const staff = await this.prisma.staff.findFirst({ where: { restaurantId } });
    if (staff) {
      await this.prisma.user.delete({ where: { id: staff.userId } }).catch(() => {
        // Already gone — non-fatal for a demo teardown.
      });
    }
    await this.prisma.restaurant.delete({ where: { id: restaurantId } });
  }

  /**
   * Scheduled cleanup entry point (wired to a cron job in DemoModule):
   * deletes any demo restaurant whose session has been expired for longer
   * than the cooldown window, so abandoned demos don't pile up forever even
   * if nobody ever comes back to trigger a fresh one.
   */
  async cleanupStaleDemoSessions() {
    const cutoff = new Date(Date.now() - COOLDOWN_DAYS * 24 * 60 * 60 * 1000);
    const stale = await this.prisma.demoSession.findMany({ where: { issuedAt: { lt: cutoff } } });
    for (const session of stale) {
      await this.teardownDemo(session.restaurantId).catch(() => {});
      await this.prisma.demoSession.delete({ where: { id: session.id } }).catch(() => {});
    }
    return { cleaned: stale.length };
  }
}
