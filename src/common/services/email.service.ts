import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class EmailService {
  constructor(private readonly mailService: MailerService) {}

  async sendMail(options: MailOptions) {
    await this.mailService.sendMail({
      from: options.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
  }
}
