import { Controller, Get, Patch, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Get('settings')
  async getSettings(@CurrentUser('id') userId: string) {
    return this.usersService.getSettings(userId);
  }

  @Patch('settings')
  async updateSettings(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.usersService.updateSettings(userId, dto);
  }

  @Post('push-token')
  async registerPushToken(
    @CurrentUser('id') userId: string,
    @Body() dto: RegisterPushTokenDto,
  ) {
    return this.usersService.registerPushToken(userId, dto);
  }
}

