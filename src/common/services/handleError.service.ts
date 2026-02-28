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
    if (error.code === '23505') {
      const detail: string | undefined = error.detail;

      if (!detail) return null;

      // detail typical format:
      // Key (email)=(example@gmail.com) already exists.
      const match = detail.match(/\((.*?)\)=/);

      const field = match ? match[1] : null; // returns "email", "username", etc.
      throw new BadRequestException(
        `${field ? field : 'Field'} already exists`,
      );
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
