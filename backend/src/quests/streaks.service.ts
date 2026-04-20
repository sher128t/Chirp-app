import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { SelfCareArea } from '@prisma/client';

@Injectable()
export class StreaksService {
  constructor(private readonly prisma: PrismaService) {}

  async getStreaks(userId: string) {
    const streaks = await this.prisma.streak.findMany({
      where: { userId },
    });

    // If no streaks exist, create default ones
    if (streaks.length === 0) {
      const areas = Object.values(SelfCareArea);
      for (const area of areas) {
        await this.prisma.streak.create({
          data: {
            userId,
            selfCareArea: area,
            currentStreakDays: 0,
            longestStreakDays: 0,
          },
        });
      }

      return this.prisma.streak.findMany({
        where: { userId },
      });
    }

    return streaks;
  }

  async updateStreak(userId: string, selfCareArea: SelfCareArea) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streak = await this.prisma.streak.findUnique({
      where: {
        userId_selfCareArea: {
          userId,
          selfCareArea,
        },
      },
    });

    if (!streak) {
      // Create new streak
      return this.prisma.streak.create({
        data: {
          userId,
          selfCareArea,
          currentStreakDays: 1,
          longestStreakDays: 1,
          lastActiveDate: today,
        },
      });
    }

    // Check if already active today
    if (streak.lastActiveDate) {
      const lastActive = new Date(streak.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      if (lastActive.getTime() === today.getTime()) {
        // Already updated today
        return streak;
      }

      // Check if yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastActive.getTime() === yesterday.getTime()) {
        // Continue streak
        const newCurrent = streak.currentStreakDays + 1;
        const newLongest = Math.max(newCurrent, streak.longestStreakDays);

        return this.prisma.streak.update({
          where: { id: streak.id },
          data: {
            currentStreakDays: newCurrent,
            longestStreakDays: newLongest,
            lastActiveDate: today,
          },
        });
      }
    }

    // Streak broken, start over
    return this.prisma.streak.update({
      where: { id: streak.id },
      data: {
        currentStreakDays: 1,
        lastActiveDate: today,
      },
    });
  }

  async checkAndResetStreaks(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const streaks = await this.prisma.streak.findMany({
      where: { userId },
    });

    for (const streak of streaks) {
      if (streak.lastActiveDate) {
        const lastActive = new Date(streak.lastActiveDate);
        lastActive.setHours(0, 0, 0, 0);

        // If last active was before yesterday, reset streak
        if (lastActive.getTime() < yesterday.getTime()) {
          await this.prisma.streak.update({
            where: { id: streak.id },
            data: {
              currentStreakDays: 0,
            },
          });
        }
      }
    }
  }
}

