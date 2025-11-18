import { Type } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

//import { User } from 'src/users/entities/user.entity';

export class CreateGoalDto {
  // @IsUUID()
  // user: User;

  @IsString()
  title: string;

  @IsUUID()
  categoryId: string;

  @IsNumber()
  totalHours: number;

  // @IsNumber()
  // currentHours: number;

  @IsString()
  @IsOptional()
  percent: string;

  @IsDate()
  @Type(() => Date) //Transform the type of data
  dueDate: Date;

  @IsString()
  @MaxLength(150)
  @MinLength(10)
  description: string;
}
