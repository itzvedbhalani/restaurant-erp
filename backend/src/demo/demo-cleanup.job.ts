import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DemoService } from './demo.service';

@Injectable()
export class DemoCleanupJob {
  private readonly logger = new Logger(DemoCleanupJob.name);

  constructor(private demoService: DemoService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCleanup() {
    const result = await this.demoService.cleanupStaleDemoSessions();
    if (result.cleaned > 0) {
      this.logger.log(`Cleaned up ${result.cleaned} stale demo restaurant(s)`);
    }
  }
}
