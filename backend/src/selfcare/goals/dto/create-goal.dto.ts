import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { SelfCareArea, ScheduleType } from '@prisma/client';

export class CreateGoalDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsEnum(SelfCareArea)
  selfCareArea: SelfCareArea;

  @IsOptional()
  @IsEnum(ScheduleType)
  scheduleType?: ScheduleType;

  @IsOptional()
  scheduleData?: any;
}

