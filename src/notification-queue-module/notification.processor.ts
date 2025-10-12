// import { Process, Processor } from '@nestjs/bull';
// import type { Job } from 'bull';

// interface NotificationJobData {
//   userId: string;
//   message: string;
// }

// @Processor('notification-queue') // tên queue phải trùng với tên trong registerQueue
// export class NotificationProcessor {
//   // Process job có tên "sendNotification"
//   @Process('sendNotification')
//   handleSendNotification(job: Job<NotificationJobData>) {
//     const { userId, message } = job.data;

//     console.log(`📨 Sending notification to user ${userId}: ${message}`);

//     // Ví dụ: gọi service hoặc gateway để gửi noti realtime
//     // await this.notificationService.sendToUser(userId, message);

//     return { status: 'done', userId };
//   }
// }
