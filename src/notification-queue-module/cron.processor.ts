import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';

interface NotificationJobData {
  userId: string;
  message: string;
}

@Processor('cronQueue')
export class CronProcessor {
  @Process('logJob')
  handleLogJob(job: Job<NotificationJobData>) {
    const { data } = job;
    console.log('🕒 Cron job triggered:', data);
  }
}
