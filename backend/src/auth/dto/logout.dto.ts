import { IsString, IsOptional } from 'class-validator';

export class LogoutDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

