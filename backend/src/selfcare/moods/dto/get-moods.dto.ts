import { IsOptional, IsDateString, IsNumber, Max } from 'class-validator';

export class GetMoodsDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsNumber()
  @Max(100)
  limit?: number;
}

