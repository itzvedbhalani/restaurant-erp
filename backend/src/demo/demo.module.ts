import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';
import { DemoCleanupJob } from './demo-cleanup.job';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'restaurant_erp_super_secret_key_987654321',
    }),
  ],
  controllers: [DemoController],
  providers: [DemoService, DemoCleanupJob],
})
export class DemoModule {}
