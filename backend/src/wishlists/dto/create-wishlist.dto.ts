import {
  IsString,
  IsUrl,
  IsArray,
  IsOptional,
  MaxLength,
  MinLength,
  ArrayNotEmpty,
  IsInt,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWishlistDto {
  @IsString()
  @MinLength(1)
  @MaxLength(250)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1500)
  description?: string;

  @IsUrl()
  image: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @Type(() => Number)
  itemsId: number[];
}
