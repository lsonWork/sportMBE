/* eslint-disable */
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {
    this.logger.log('Gmail SMTP mail service initialized successfully');
  }

  async sendOtp(to: string, subject: string, templateData?: any) {
    const { otp } = templateData || {};

    this.logger.log(`Attempting to send OTP email to: ${to}`);
    this.logger.debug(`Email details: ${JSON.stringify({ to, subject, otp })}`);

    try {
      await this.mailerService.sendMail({
        to,
        subject,
        html: this.getOtpEmailTemplate(otp),
      });

      this.logger.log(`Email sent successfully to: ${to}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to send email to: ${to}`);
      this.logger.error(`Error details: ${JSON.stringify(error.message)}`);

      // Handle specific Gmail SMTP errors
      if (error.code === 'EAUTH') {
        this.logger.error('Gmail authentication failed. Please check MAIL_ADDRESS and MAIL_PASSWORD.');
        throw new HttpException(
          'Email service authentication failed. Please contact support.',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      } else if (error.code === 'ECONNECTION') {
        throw new HttpException(
          'Cannot connect to email service. Please try again later.',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      throw new HttpException(
        'Failed to send email. Please try again or contact support.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private getOtpEmailTemplate(otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your OTP Code</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">SportM</h1>
          </div>

          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Xác thực tài khoản của bạn</h2>

            <p style="font-size: 16px; color: #666;">
              Chúng tôi đã nhận được yêu cầu xác thực tài khoản của bạn. Vui lòng sử dụng mã OTP bên dưới:
            </p>

            <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${otp}
              </div>
            </div>

            <p style="font-size: 14px; color: #999;">
              <strong>Lưu ý:</strong> Mã OTP này có hiệu lực trong 15 phút.
            </p>

            <p style="font-size: 14px; color: #999;">
              Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="font-size: 12px; color: #999; text-align: center;">
              © ${new Date().getFullYear()} SportM. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `;
  }
}
