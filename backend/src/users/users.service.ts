import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        timezone: true,
        locale: true,
        createdAt: true,
        lastLoginAt: true,
        settings: {
          select: {
            notificationsEnabled: true,
            marketingOptIn: true,
            darkMode: true,
          },
        },
        subscription: {
          select: {
            tier: true,
            expiresAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    const settings = await this.prisma.userSettings.upsert({
      where: { userId },
      update: dto,
      create: {
        userId,
        ...dto,
      },
    });

    return settings;
  }

  async getSettings(userId: string) {
    return this.prisma.userSettings.findUnique({
      where: { userId },
    });
  }

  async registerPushToken(userId: string, dto: RegisterPushTokenDto) {
    // Upsert push token (update if same token exists, create if not)
    const token = await this.prisma.pushToken.upsert({
      where: { token: dto.token },
      update: {
        userId,
        platform: dto.platform,
      },
      create: {
        userId,
        token: dto.token,
        platform: dto.platform,
      },
    });

    return { success: true, tokenId: token.id };
  }

  async removePushToken(token: string) {
    await this.prisma.pushToken.deleteMany({
      where: { token },
    });

    return { success: true };
  }
}

