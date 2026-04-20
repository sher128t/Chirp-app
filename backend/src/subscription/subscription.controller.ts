import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('subscription')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  async getSubscription(@CurrentUser('id') userId: string) {
    return this.subscriptionService.getSubscription(userId);
  }

  @Post('upgrade')
  async upgradeToPremium(@CurrentUser('id') userId: string) {
    return this.subscriptionService.upgradeToPremium(userId);
  }

  @Post('downgrade')
  async downgradeToFree(@CurrentUser('id') userId: string) {
    return this.subscriptionService.downgradeToFree(userId);
  }
}

