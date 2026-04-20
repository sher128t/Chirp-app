import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('insights')
@UseGuards(JwtAuthGuard)
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('summary')
  async getSummary(
    @CurrentUser('id') userId: string,
    @Query('period') period?: string,
  ) {
    // Parse period (e.g., "7d", "30d")
    let days = 7;
    if (period) {
      const match = period.match(/^(\d+)d$/);
      if (match) {
        days = parseInt(match[1], 10);
        if (days > 90) days = 90; // Cap at 90 days
      }
    }

    return this.insightsService.getSummary(userId, days);
  }
}

