import { IsString, IsNumber, IsOptional, IsIn, Min } from 'class-validator';

export class CompleteBreathingDto {
  @IsString()
  @IsIn(['box', '478', 'relaxing', 'energizing'])
  exerciseType: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  durationSecs?: number;
}

