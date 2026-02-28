import { Module } from '@nestjs/common';
import { HandleErrorService } from './services/handleError.service';
import { EmailService } from './services/email.service';

@Module({
  providers: [HandleErrorService, EmailService],
  exports: [HandleErrorService, EmailService],
})
export class CommonModule {}
