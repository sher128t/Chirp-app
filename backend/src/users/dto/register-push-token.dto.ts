import { IsString, IsIn } from 'class-validator';

export class RegisterPushTokenDto {
  @IsString()
  token: string;

  @IsString()
  @IsIn(['ios', 'android'])
  platform: string;
}

