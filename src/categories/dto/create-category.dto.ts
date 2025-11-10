import { IsString } from 'class-validator';

//TODO: verificar si se actualiza el update
export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  description: string;
}
