import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateStaffDto, ClockInDto, ClockOutDto, CreateRoleDto, CreateStaffDto } from './dto/users.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users & Staff Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('users')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Get all users in the system' })
  async findAllUsers() {
    return this.usersService.findAllUsers();
  }

  @Get('users/roles')
  @Roles('SUPER_ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Get all roles and permissions' })
  async findAllRoles() {
    return this.usersService.findAllRoles();
  }

  @Post('users/roles')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new role mapping permissions' })
  async createRole(@Body() dto: CreateRoleDto) {
    return this.usersService.createRole(dto);
  }

  // Staff endpoints
  @Post('staff')
  @Roles('SUPER_ADMIN', 'OWNER')
  @ApiOperation({
    summary:
      'Create a staff account. OWNER creates within their own restaurant only; SUPER_ADMIN must specify restaurantId. Cannot create OWNER/SUPER_ADMIN accounts.',
  })
  async createStaff(@Request() req, @Body() dto: CreateStaffDto) {
    return this.usersService.createStaff(dto, {
      role: req.user.role,
      restaurantId: req.user.restaurantId,
    });
  }

  @Get('staff/restaurant/:restaurantId')
  @Roles('SUPER_ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Get all staff of a restaurant outlet' })
  async findAllStaff(@Param('restaurantId') restaurantId: string) {
    return this.usersService.findAllStaffByRestaurant(restaurantId);
  }

  @Put('staff/:id')
  @Roles('SUPER_ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Update a staff member details' })
  async updateStaff(@Param('id') id: string, @Body() dto: UpdateStaffDto) {
    return this.usersService.updateStaff(id, dto);
  }

  @Delete('staff/:id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a staff member (cascade deletes user)' })
  async deleteStaff(@Param('id') id: string) {
    return this.usersService.deleteStaff(id);
  }

  // Attendance
  @Post('staff/:staffId/attendance/clock-in')
  @ApiOperation({ summary: 'Clock in attendance for today' })
  async clockIn(@Param('staffId') staffId: string, @Body() dto: ClockInDto) {
    return this.usersService.clockIn(staffId, dto);
  }

  @Post('staff/:staffId/attendance/clock-out')
  @ApiOperation({ summary: 'Clock out attendance for today' })
  async clockOut(@Param('staffId') staffId: string, @Body() dto: ClockOutDto) {
    return this.usersService.clockOut(staffId, dto);
  }

  @Get('staff/:staffId/attendance/history')
  @ApiOperation({ summary: 'Get attendance history of a staff' })
  async getAttendanceHistory(@Param('staffId') staffId: string) {
    return this.usersService.getAttendanceHistory(staffId);
  }

  @Get('staff/attendance/summary/restaurant/:restaurantId')
  @Roles('SUPER_ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Get todays attendance summary for a restaurant' })
  async getTodayAttendanceSummary(@Param('restaurantId') restaurantId: string) {
    return this.usersService.getTodayAttendanceSummary(restaurantId);
  }
}
