import { IsArray, IsDate, IsNumber, IsString, IsUUID } from 'class-validator';
import { Category } from 'src/categories/entities/category.entity';

export class CreateGoalDto {
  @IsUUID()
  userId: string;

  @IsString()
  title: string;

  @IsArray()
  category: Category[];

  @IsNumber()
  targetHour: number;

  @IsNumber()
  currentHours: number;

  @IsNumber()
  percet: number;

  @IsDate()
  deadLine: Date;

  @IsString()
  description: string;
}
