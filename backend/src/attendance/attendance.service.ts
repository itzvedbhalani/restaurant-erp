import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  private startOfToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  /** Returns today's attendance record for this staff member, if any. */
  async getMyStatus(staffId: string) {
    const record = await this.prisma.attendance.findFirst({
      where: { staffId, date: this.startOfToday() },
    });
    return record;
  }

  async clockIn(staffId: string) {
    const existing = await this.getMyStatus(staffId);
    if (existing) {
      throw new BadRequestException('You have already clocked in today.');
    }

    return this.prisma.attendance.create({
      data: {
        staffId,
        date: this.startOfToday(),
        clockIn: new Date(),
        status: 'PRESENT',
      },
    });
  }

  async clockOut(staffId: string) {
    const existing = await this.getMyStatus(staffId);
    if (!existing) {
      throw new BadRequestException('You have not clocked in today yet.');
    }
    if (existing.clockOut) {
      throw new BadRequestException('You have already clocked out today.');
    }

    return this.prisma.attendance.update({
      where: { id: existing.id },
      data: { clockOut: new Date() },
    });
  }

  async findByRestaurant(restaurantId: string, date?: string) {
    const targetDate = date ? new Date(date) : this.startOfToday();
    targetDate.setHours(0, 0, 0, 0);

    return this.prisma.attendance.findMany({
      where: {
        staff: { restaurantId },
        date: targetDate,
      },
      include: {
        staff: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: { clockIn: 'desc' },
    });
  }
}
