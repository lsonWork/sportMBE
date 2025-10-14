import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class CronProducerService {
  constructor(@InjectQueue('cronQueue') private readonly queue: Queue) {}

  async scheduleJob(data: any, delayMs: number) {
    await this.queue.add('logJob', data, {
      delay: delayMs,
      attempts: 1,
      removeOnComplete: true,
    });
  }
}
