import { IsString, IsArray, IsOptional, MaxLength } from 'class-validator';

export class CreateJournalEntryDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsString()
  @MaxLength(10000)
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

