import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

@Injectable()
export class HandleErrorService {
  private readonly logger: Logger;
  constructor() {
    this.logger = new Logger(HandleErrorService.name);
  }

  error(error: { code?: string; detail?: string }) {
    console.log(error);

    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    if (error.code === '23503') {
      throw new BadRequestException('Error related to foreign key constraint.');
    }

    this.logger.error(error);

    throw new InternalServerErrorException(
      'Unexpected error, check Server logs',
    );
  }
}
