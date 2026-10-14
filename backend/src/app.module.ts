import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { MenuModule } from './menu/menu.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrderModule } from './order/order.module';
import { ComplaintModule } from './complaint/complaint.module';
import { SettingsModule } from './settings/settings.module';
import { RealtimeModule } from './realtime/realtime.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationModule } from './notification/notification.module';
import { AttendanceModule } from './attendance/attendance.module';
import { DemoModule } from './demo/demo.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    RestaurantModule,
    MenuModule,
    InventoryModule,
    OrderModule,
    ComplaintModule,
    SettingsModule,
    RealtimeModule,
    DashboardModule,
    NotificationModule,
    AttendanceModule,
    DemoModule,
  ],
})
export class AppModule {}
