import { Controller, Get, Post, Query, Param, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Get('me')
  @ApiOperation({ summary: "Get the current user's clock-in status for today" })
  async getMyStatus(@Req() req: any) {
    if (!req.user.staffId) {
      // Super Admin / non-staff accounts have nothing to clock in/out of.
      return null;
    }
    return this.attendanceService.getMyStatus(req.user.staffId);
  }

  @Post('clock-in')
  @ApiOperation({ summary: 'Clock in for today' })
  async clockIn(@Req() req: any) {
    if (!req.user.staffId) {
      throw new BadRequestException('This account is not linked to a staff profile.');
    }
    return this.attendanceService.clockIn(req.user.staffId);
  }

  @Post('clock-out')
  @ApiOperation({ summary: 'Clock out for today' })
  async clockOut(@Req() req: any) {
    if (!req.user.staffId) {
      throw new BadRequestException('This account is not linked to a staff profile.');
    }
    return this.attendanceService.clockOut(req.user.staffId);
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: "Get a restaurant's attendance for a given day (defaults to today)" })
  async findByRestaurant(@Param('restaurantId') restaurantId: string, @Query('date') date?: string) {
    return this.attendanceService.findByRestaurant(restaurantId, date);
  }
}
