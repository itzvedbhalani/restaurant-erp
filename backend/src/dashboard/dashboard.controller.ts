import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Dashboards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('super-admin')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Get SaaS analytics for Super Admins' })
  async getSuperAdminStats() {
    return this.dashboardService.getSuperAdminStats();
  }

  @Get('owner/:restaurantId')
  @Roles('SUPER_ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Get business analytics for Owners' })
  async getOwnerStats(@Param('restaurantId') restaurantId: string) {
    return this.dashboardService.getOwnerStats(restaurantId);
  }

  @Get('reports/:restaurantId')
  @Roles('SUPER_ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Get best-sellers, staff performance, and sales trend for a custom date range' })
  async getReports(
    @Param('restaurantId') restaurantId: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.dashboardService.getReports(restaurantId, start, end);
  }
}
