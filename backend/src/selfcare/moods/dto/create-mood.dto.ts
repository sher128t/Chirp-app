import { IsNumber, IsString, IsArray, IsOptional, Min, Max } from 'class-validator';

export class CreateMoodDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  moodScore: number;

  @IsString()
  moodLabel: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}

