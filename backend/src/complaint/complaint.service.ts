import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComplaintDto, ResolveComplaintDto, AddCommentDto } from './dto/complaint.dto';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class ComplaintService {
  constructor(
    private prisma: PrismaService,
    private realtime: RealtimeGateway,
  ) {}

  async createComplaint(dto: CreateComplaintDto) {
    const complaint = await this.prisma.complaint.create({
      data: {
        reporterId: dto.reporterId,
        category: dto.category,
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        status: 'OPEN',
      },
      include: {
        reporter: {
          select: {
            name: true,
            email: true,
            staff: { select: { restaurantId: true } },
          },
        },
      },
    });

    // Notify Super Admins (all restaurants) and only the Owner(s) of the
    // reporting staff member's own restaurant — not every owner across
    // every tenant in the system.
    const reporterRestaurantId = complaint.reporter.staff?.restaurantId;

    const ownersAndAdmins = await this.prisma.user.findMany({
      where: {
        role: { name: 'SUPER_ADMIN' },
      },
    });

    if (reporterRestaurantId) {
      const restaurantOwners = await this.prisma.user.findMany({
        where: {
          role: { name: 'OWNER' },
          staff: { restaurantId: reporterRestaurantId },
        },
      });
      ownersAndAdmins.push(...restaurantOwners);
    }

    for (const admin of ownersAndAdmins) {
      const notif = await this.prisma.notification.create({
        data: {
          userId: admin.id,
          title: `New Complaint: ${complaint.title}`,
          message: `Priority: ${complaint.priority}. Filed by ${complaint.reporter.name}`,
          type: 'COMPLAINT',
        },
      });

      this.realtime.sendNotification(admin.id, notif);
    }

    this.realtime.sendComplaintUpdate(complaint);
    return complaint;
  }

  async findAllComplaints(userId?: string, role?: string) {
    if (role === 'SUPER_ADMIN' || role === 'OWNER') {
      return this.prisma.complaint.findMany({
        include: {
          reporter: { select: { name: true } },
          resolvedBy: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Standard staff can only view their reported tickets
    return this.prisma.complaint.findMany({
      where: { reporterId: userId },
      include: {
        reporter: { select: { name: true } },
        resolvedBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneComplaint(id: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        resolvedBy: { select: { id: true, name: true } },
        comments: {
          include: {
            user: { select: { id: true, name: true, role: { select: { name: true } } } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!complaint) throw new NotFoundException('Complaint ticket not found');
    return complaint;
  }

  async updateStatus(id: string, status: string) {
    const complaint = await this.prisma.complaint.update({
      where: { id },
      data: { status },
      include: {
        reporter: { select: { name: true } },
      },
    });

    this.realtime.sendComplaintUpdate(complaint);
    return complaint;
  }

  async resolveComplaint(id: string, dto: ResolveComplaintDto) {
    const complaint = await this.prisma.complaint.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedById: dto.resolvedById,
        resolutionNotes: dto.resolutionNotes,
      },
      include: {
        reporter: { select: { name: true } },
      },
    });

    // Notify Reporter
    const notif = await this.prisma.notification.create({
      data: {
        userId: complaint.reporterId,
        title: `Complaint Resolved: ${complaint.title}`,
        message: `Your complaint has been resolved. Note: ${dto.resolutionNotes}`,
        type: 'COMPLAINT',
      },
    });
    this.realtime.sendNotification(complaint.reporterId, notif);

    this.realtime.sendComplaintUpdate(complaint);
    return complaint;
  }

  async addComment(complaintId: string, dto: AddCommentDto) {
    const comment = await this.prisma.complaintComment.create({
      data: {
        complaintId,
        userId: dto.userId,
        comment: dto.comment,
      },
      include: {
        user: { select: { name: true } },
      },
    });

    const complaint = await this.findOneComplaint(complaintId);
    this.realtime.sendComplaintUpdate(complaint);

    return comment;
  }
}
