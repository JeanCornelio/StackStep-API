import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserFrom, UserRoles, UserState } from 'src/enums/user';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  username: string;

  @IsString()
  @IsOptional()
  avatarUrl: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;

  @IsOptional()
  @IsEnum(UserRoles, { each: true })
  roles: UserRoles[];

  @IsOptional()
  @IsEnum(UserFrom)
  from: UserFrom;

  @IsOptional()
  @IsEnum(UserState)
  state: UserState;
}
