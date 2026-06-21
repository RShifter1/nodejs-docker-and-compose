import { IsString, IsUrl, IsNumber, MaxLength, MinLength, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWishDto {
  @IsString()
  @MinLength(1)
  @MaxLength(250)
  name: string;

  @IsUrl()
  link: string;

  @IsUrl()
  image: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price: number;

  @IsString()
  @MinLength(1)
  @MaxLength(1024)
  description: string;
}
