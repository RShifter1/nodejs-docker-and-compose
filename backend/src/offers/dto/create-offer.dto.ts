import { IsNumber, IsPositive, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOfferDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  itemId: number;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  amount: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hidden?: boolean;
}
