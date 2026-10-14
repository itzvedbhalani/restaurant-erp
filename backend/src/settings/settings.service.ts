import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BatchUpdateSettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async updateSettings(restaurantId: string, dto: BatchUpdateSettingsDto) {
    const results = [];
    for (const item of dto.settings) {
      const setting = await this.prisma.setting.upsert({
        where: {
          restaurantId_key: {
            restaurantId,
            key: item.key,
          },
        },
        update: {
          value: item.value,
          type: item.type ?? 'STRING',
        },
        create: {
          restaurantId,
          key: item.key,
          value: item.value,
          type: item.type ?? 'STRING',
        },
      });
      results.push(setting);
    }
    return results;
  }

  async findAllSettings(restaurantId: string) {
    return this.prisma.setting.findMany({
      where: { restaurantId },
    });
  }

  async findSettingByKey(restaurantId: string, key: string) {
    const setting = await this.prisma.setting.findUnique({
      where: {
        restaurantId_key: {
          restaurantId,
          key,
        },
      },
    });

    if (!setting) throw new NotFoundException(`Setting for key '${key}' not found`);
    return setting;
  }
}
