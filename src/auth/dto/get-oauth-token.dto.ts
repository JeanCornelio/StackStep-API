import { IsString } from 'class-validator';

export class GetOAuthTokenDto {
  @IsString()
  code: string;
}
