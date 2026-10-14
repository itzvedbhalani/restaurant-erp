import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ComplaintService } from './complaint.service';
import { CreateComplaintDto, ResolveComplaintDto, AddCommentDto, UpdateComplaintStatusDto } from './dto/complaint.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Complaints Ticketing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('complaints')
export class ComplaintController {
  constructor(private complaintService: ComplaintService) {}

  @Post()
  @ApiOperation({ summary: 'File a new complaint' })
  async createComplaint(@Body() dto: CreateComplaintDto) {
    return this.complaintService.createComplaint(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all complaints (Admins see all, staff see only their own)' })
  async findAll(@Request() req) {
    return this.complaintService.findAllComplaints(req.user.id, req.user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific complaint and comment details' })
  async findOne(@Param('id') id: string) {
    return this.complaintService.findOneComplaint(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Change complaint ticket status' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateComplaintStatusDto) {
    return this.complaintService.updateStatus(id, dto.status);
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: 'Resolve a complaint' })
  async resolve(@Param('id') id: string, @Body() dto: ResolveComplaintDto) {
    return this.complaintService.resolveComplaint(id, dto);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add comment on a complaint ticket' })
  async addComment(@Param('id') id: string, @Body() dto: AddCommentDto) {
    return this.complaintService.addComment(id, dto);
  }
}
