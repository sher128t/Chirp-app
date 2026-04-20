import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { SubscriptionTier } from '@prisma/client';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async getSubscription(userId: string) {
    let subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      subscription = await this.prisma.subscription.create({
        data: {
          userId,
          tier: 'FREE',
        },
      });
    }

    return {
      tier: subscription.tier,
      isPremium: subscription.tier === 'PREMIUM',
      startedAt: subscription.startedAt,
      expiresAt: subscription.expiresAt,
      features: this.getFeatures(subscription.tier),
    };
  }

  async upgradeToPremium(userId: string) {
    // For MVP, this is a mock upgrade
    // In production, this would integrate with App Store / Play Store

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year subscription

    const subscription = await this.prisma.subscription.upsert({
      where: { userId },
      update: {
        tier: 'PREMIUM',
        fakeStripeId: `mock_sub_${Date.now()}`,
        expiresAt,
      },
      create: {
        userId,
        tier: 'PREMIUM',
        fakeStripeId: `mock_sub_${Date.now()}`,
        expiresAt,
      },
    });

    return {
      success: true,
      tier: subscription.tier,
      isPremium: true,
      expiresAt: subscription.expiresAt,
      features: this.getFeatures('PREMIUM'),
      message: 'Successfully upgraded to Premium! (This is a mock upgrade for testing)',
    };
  }

  async downgradeToFree(userId: string) {
    const subscription = await this.prisma.subscription.upsert({
      where: { userId },
      update: {
        tier: 'FREE',
        fakeStripeId: null,
        expiresAt: null,
      },
      create: {
        userId,
        tier: 'FREE',
      },
    });

    return {
      success: true,
      tier: subscription.tier,
      isPremium: false,
      features: this.getFeatures('FREE'),
    };
  }

  private getFeatures(tier: SubscriptionTier) {
    const baseFeatures = [
      'Basic pet customization',
      'Mood tracking',
      'Goal setting (up to 5)',
      'Journaling',
      'Breathing exercises',
      'Daily quests',
    ];

    if (tier === 'PREMIUM') {
      return [
        ...baseFeatures,
        'Unlimited goals',
        'Premium items & backgrounds',
        'Advanced insights & analytics',
        'Priority support',
        'Exclusive seasonal items',
        'Journal themes',
        'No ads',
      ];
    }

    return baseFeatures;
  }
}

