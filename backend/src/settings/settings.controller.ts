import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { BatchUpdateSettingsDto } from './dto/settings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Settings Configuration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Post('restaurant/:restaurantId')
  @Roles('SUPER_ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Batch update settings for a restaurant' })
  async updateSettings(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: BatchUpdateSettingsDto,
  ) {
    return this.settingsService.updateSettings(restaurantId, dto);
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get all settings for a restaurant' })
  async findAll(@Param('restaurantId') restaurantId: string) {
    return this.settingsService.findAllSettings(restaurantId);
  }

  @Get('restaurant/:restaurantId/key/:key')
  @ApiOperation({ summary: 'Get specific setting key value' })
  async findByKey(
    @Param('restaurantId') restaurantId: string,
    @Param('key') key: string,
  ) {
    return this.settingsService.findSettingByKey(restaurantId, key);
  }
}
