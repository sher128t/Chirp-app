import { IsString, IsArray, IsOptional, IsNumber, Max } from 'class-validator';

export class GetJournalEntriesDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsNumber()
  offset?: number;
}

