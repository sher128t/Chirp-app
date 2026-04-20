import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get('wallet')
  async getWallet(@CurrentUser('id') userId: string) {
    return this.rewardsService.getWallet(userId);
  }

  @Get('transactions')
  async getTransactions(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.rewardsService.getTransactions(userId, limit || 50);
  }
}

