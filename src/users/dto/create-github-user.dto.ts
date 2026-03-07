import { OmitType } from '@nestjs/swagger';

import { CreateUserDto } from './create-user.dto';

export class CreateGithubUserDto extends OmitType(CreateUserDto, [
  'password',
]) {}
