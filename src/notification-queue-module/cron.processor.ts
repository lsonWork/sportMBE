import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { NotificationType } from 'src/common/enum/NotificationType';
import { Notification } from 'src/notification/entities/notification.entity';
import { NotificationGateway } from 'src/notification/notification.gateway';

interface NotificationJobData {
  id: string;
  type: NotificationType;
  message: string;
  actor: { id: string; name: string };
  createdAt: string;
  toId: string;
}

@Processor('cronQueue')
export class CronProcessor {
  constructor(private readonly notificationGateway: NotificationGateway) {}
  @Process('logJob')
  handleLogJob(job: Job<NotificationJobData>) {
    const { data } = job;
    const { toId, ...responseEvent } = data;
    this.notificationGateway.emitEvent(toId, responseEvent, data.type);
  }
}
