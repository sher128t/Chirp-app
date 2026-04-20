import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { SelfCareArea, ScheduleType } from '@prisma/client';

export class UpdateGoalDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsEnum(SelfCareArea)
  selfCareArea?: SelfCareArea;

  @IsOptional()
  @IsEnum(ScheduleType)
  scheduleType?: ScheduleType;

  @IsOptional()
  scheduleData?: any;
}

