import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

export class GetGoalDto extends PaginationDto {
  @IsString()
  @IsOptional()
  term: string;

  @IsString()
  @IsOptional()
  categoryId: string;
}
