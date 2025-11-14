import { Module } from '@nestjs/common';
import { HandleErrorService } from './services/handleError.service';

@Module({
  providers: [HandleErrorService],
  exports: [HandleErrorService],
})
export class CommonModule {}
