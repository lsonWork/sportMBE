import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
// import { MailerModule } from '@nestjs-modules/mailer';
// import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
// import { join } from 'path';

@Module({
  imports: [
    // MailerModule.forRootAsync({
    //   useFactory: () => ({
    //     transport: {
    //       service: 'SendGrid',
    //       auth: {
    //         api_key: process.env.SENDGRID_API_KEY,
    //       },
    //     },
    //     defaults: {
    //       from: process.env.MAIL_ADDRESS || 'no-reply@sportm.com',
    //     },
    //     template: {
    //       dir: join(process.cwd(), 'src', 'mail', 'templates'),
    //       adapter: new HandlebarsAdapter(),
    //       options: {
    //         strict: true,
    //       },
    //     },
    //   }),
    // }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
