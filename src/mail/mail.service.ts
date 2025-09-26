/* eslint-disable */
import { Injectable } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
  }
  async sendOtp(to: string, subject: string, templateData?: any) {
    try {
      await sgMail.send({
        to,
        from: process.env.MAIL_ADDRESS || 'no-reply@sportm.com',
        subject,
        templateId: 'd-2cf90b9a62bd4bf3af3b81055a5cc881',
        dynamicTemplateData: templateData,
      });
    } catch (error) {
      throw error;
    }
  }
}
