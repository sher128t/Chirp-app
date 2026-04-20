import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../common/prisma/prisma.service';
import { PetService } from '../pet/pet.service';
import { RewardsService } from '../rewards/rewards.service';

@Injectable()
export class QuestsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => PetService))
    private readonly petService: PetService,
    @Inject(forwardRef(() => RewardsService))
    private readonly rewardsService: RewardsService,
  ) {}

  async getTodayQuests(userId: string) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Get active daily quests for user
    let quests = await this.prisma.userQuest.findMany({
      where: {
        userId,
        expiresAt: { gte: new Date() },
        state: { in: ['ACTIVE', 'COMPLETED'] },
      },
      include: {
        questTemplate: true,
      },
    });

    // If no quests for today, generate them
    if (quests.length === 0) {
      await this.generateDailyQuests(userId);
      quests = await this.prisma.userQuest.findMany({
        where: {
          userId,
          expiresAt: { gte: new Date() },
          state: { in: ['ACTIVE', 'COMPLETED'] },
        },
        include: {
          questTemplate: true,
        },
      });
    }

    return quests.map((q) => ({
      id: q.id,
      title: q.questTemplate.title,
      description: q.questTemplate.description,
      type: q.questTemplate.type,
      selfCareArea: q.questTemplate.selfCareArea,
      requirements: q.questTemplate.requirementsJson,
      rewards: q.questTemplate.rewardsJson,
      state: q.state,
      progress: q.progressJson,
      expiresAt: q.expiresAt,
    }));
  }

  async claimQuest(userId: string, questId: string) {
    const userQuest = await this.prisma.userQuest.findFirst({
      where: {
        id: questId,
        userId,
      },
      include: {
        questTemplate: true,
      },
    });

    if (!userQuest) {
      throw new NotFoundException('Quest not found');
    }

    if (userQuest.state !== 'COMPLETED') {
      throw new BadRequestException('Quest is not completed');
    }

    // Get rewards from template
    const rewards = userQuest.questTemplate.rewardsJson as any;

    // Apply rewards
    if (rewards.xp) {
      await this.petService.addXp(userId, rewards.xp);
    }

    if (rewards.coins) {
      await this.rewardsService.addCurrency(userId, 'SOFT', rewards.coins, `quest:${userQuest.questTemplate.code}`);
    }

    if (rewards.gems) {
      await this.rewardsService.addCurrency(userId, 'HARD', rewards.gems, `quest:${userQuest.questTemplate.code}`);
    }

    // Update quest state
    await this.prisma.userQuest.update({
      where: { id: questId },
      data: {
        state: 'CLAIMED',
        claimedAt: new Date(),
      },
    });

    return {
      success: true,
      rewards: {
        xp: rewards.xp || 0,
        coins: rewards.coins || 0,
        gems: rewards.gems || 0,
      },
    };
  }

  async updateQuestProgress(userId: string, action: string, selfCareArea?: string) {
    // Get active quests for user that match the action
    const activeQuests = await this.prisma.userQuest.findMany({
      where: {
        userId,
        state: 'ACTIVE',
        expiresAt: { gte: new Date() },
      },
      include: {
        questTemplate: true,
      },
    });

    for (const quest of activeQuests) {
      const requirements = quest.questTemplate.requirementsJson as any;
      const progress = quest.progressJson as any;

      // Check if this action matches the quest requirements
      if (requirements.action === action || requirements.action === 'any_activity') {
        // Update progress
        progress.count = (progress.count || 0) + 1;

        // Track unique activities for special quests
        if (requirements.unique) {
          progress.activities = progress.activities || [];
          if (!progress.activities.includes(action)) {
            progress.activities.push(action);
          }
          progress.count = progress.activities.length;
        }

        // Check if quest is complete
        const isComplete = progress.count >= requirements.count;

        await this.prisma.userQuest.update({
          where: { id: quest.id },
          data: {
            progressJson: progress,
            state: isComplete ? 'COMPLETED' : 'ACTIVE',
          },
        });
      }
    }
  }

  async generateDailyQuests(userId: string) {
    // Get active quest templates
    const templates = await this.prisma.questTemplate.findMany({
      where: {
        active: true,
        type: 'DAILY',
      },
    });

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Create user quests for each template
    for (const template of templates) {
      // Check if quest already exists for today
      const existing = await this.prisma.userQuest.findFirst({
        where: {
          userId,
          questTemplateId: template.id,
          expiresAt: today,
        },
      });

      if (!existing) {
        await this.prisma.userQuest.create({
          data: {
            userId,
            questTemplateId: template.id,
            state: 'ACTIVE',
            progressJson: { count: 0 },
            expiresAt: today,
          },
        });
      }
    }
  }

  // Cron job to generate daily quests at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateDailyQuestsForAllUsers() {
    console.log('Generating daily quests for all users...');

    const users = await this.prisma.user.findMany({
      select: { id: true },
    });

    for (const user of users) {
      await this.generateDailyQuests(user.id);
    }

    console.log(`Generated daily quests for ${users.length} users`);
  }

  // Cron job to expire old quests
  @Cron(CronExpression.EVERY_HOUR)
  async expireOldQuests() {
    const now = new Date();

    await this.prisma.userQuest.updateMany({
      where: {
        state: { in: ['ACTIVE', 'COMPLETED'] },
        expiresAt: { lt: now },
      },
      data: {
        state: 'EXPIRED',
      },
    });
  }
}

