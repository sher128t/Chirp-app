import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { QuestsService } from './quests.service';
import { StreaksService } from './streaks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class QuestsController {
  constructor(
    private readonly questsService: QuestsService,
    private readonly streaksService: StreaksService,
  ) {}

  @Get('quests/today')
  async getTodayQuests(@CurrentUser('id') userId: string) {
    return this.questsService.getTodayQuests(userId);
  }

  @Post('quests/:id/claim')
  async claimQuest(
    @CurrentUser('id') userId: string,
    @Param('id') questId: string,
  ) {
    return this.questsService.claimQuest(userId, questId);
  }

  @Get('streaks')
  async getStreaks(@CurrentUser('id') userId: string) {
    return this.streaksService.getStreaks(userId);
  }
}

