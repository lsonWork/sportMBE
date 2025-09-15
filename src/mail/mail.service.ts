/* eslint-disable */
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendOtp(to: string, subject: string, templateData?: any) {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template: 'verificationTemplate',
        context: templateData,
      });
    } catch (error) {
      throw error;
    }
  }
}
