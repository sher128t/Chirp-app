import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { SelfCareArea } from '@prisma/client';

@Injectable()
export class InsightsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string, periodDays: number = 7) {
    const from = new Date();
    from.setDate(from.getDate() - periodDays);

    // Get mood entries
    const moodEntries = await this.prisma.moodEntry.findMany({
      where: {
        userId,
        createdAt: { gte: from },
      },
    });

    const avgMoodScore =
      moodEntries.length > 0
        ? Math.round(
            (moodEntries.reduce((sum, m) => sum + m.moodScore, 0) / moodEntries.length) * 10,
          ) / 10
        : null;

    // Get goal completions
    const goalCompletions = await this.prisma.goalCompletion.findMany({
      where: {
        goal: { userId },
        completedAt: { gte: from },
      },
      include: {
        goal: {
          select: { selfCareArea: true },
        },
      },
    });

    // Count completions by self-care area
    const completionsByArea = goalCompletions.reduce(
      (acc, gc) => {
        const area = gc.goal.selfCareArea;
        acc[area] = (acc[area] || 0) + 1;
        return acc;
      },
      {} as Record<SelfCareArea, number>,
    );

    // Find most active area
    let mostActiveArea: SelfCareArea | null = null;
    let maxCompletions = 0;
    for (const [area, count] of Object.entries(completionsByArea)) {
      if (count > maxCompletions) {
        maxCompletions = count;
        mostActiveArea = area as SelfCareArea;
      }
    }

    // Find least active area (from goals that exist)
    const userGoalAreas = await this.prisma.goal.groupBy({
      by: ['selfCareArea'],
      where: {
        userId,
        archivedAt: null,
      },
    });

    let leastActiveArea: SelfCareArea | null = null;
    let minCompletions = Infinity;
    for (const { selfCareArea } of userGoalAreas) {
      const count = completionsByArea[selfCareArea] || 0;
      if (count < minCompletions) {
        minCompletions = count;
        leastActiveArea = selfCareArea;
      }
    }

    // Get streaks
    const streaks = await this.prisma.streak.findMany({
      where: { userId },
      select: {
        selfCareArea: true,
        currentStreakDays: true,
        longestStreakDays: true,
      },
    });

    // Get journal entries count
    const journalEntriesCount = await this.prisma.journalEntry.count({
      where: {
        userId,
        createdAt: { gte: from },
      },
    });

    // Get breathing sessions count
    const breathingSessionsCount = await this.prisma.breathingSession.count({
      where: {
        userId,
        completedAt: { gte: from },
      },
    });

    // Calculate mood trend
    const moodTrend = this.calculateMoodTrend(moodEntries);

    // Generate suggestions
    const suggestions = this.generateSuggestions({
      avgMoodScore,
      completionsByArea,
      leastActiveArea,
      journalEntriesCount,
      breathingSessionsCount,
      periodDays,
    });

    return {
      period: `${periodDays}d`,
      periodDays,
      mood: {
        averageScore: avgMoodScore,
        entriesCount: moodEntries.length,
        trend: moodTrend,
      },
      goals: {
        completedCount: goalCompletions.length,
        completionsByArea,
        mostActiveArea,
        leastActiveArea,
      },
      journal: {
        entriesCount: journalEntriesCount,
      },
      breathing: {
        sessionsCount: breathingSessionsCount,
      },
      streaks: streaks.map((s) => ({
        selfCareArea: s.selfCareArea,
        currentDays: s.currentStreakDays,
        longestDays: s.longestStreakDays,
      })),
      suggestions,
    };
  }

  private calculateMoodTrend(
    moodEntries: { moodScore: number; createdAt: Date }[],
  ): 'improving' | 'declining' | 'stable' | 'insufficient_data' {
    if (moodEntries.length < 3) return 'insufficient_data';

    const sorted = [...moodEntries].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );

    const halfLength = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, halfLength);
    const secondHalf = sorted.slice(halfLength);

    const firstAvg =
      firstHalf.reduce((sum, m) => sum + m.moodScore, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, m) => sum + m.moodScore, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;

    if (diff > 0.5) return 'improving';
    if (diff < -0.5) return 'declining';
    return 'stable';
  }

  private generateSuggestions(data: {
    avgMoodScore: number | null;
    completionsByArea: Record<string, number>;
    leastActiveArea: SelfCareArea | null;
    journalEntriesCount: number;
    breathingSessionsCount: number;
    periodDays: number;
  }): string[] {
    const suggestions: string[] = [];

    if (data.avgMoodScore !== null && data.avgMoodScore < 3) {
      suggestions.push(
        'Your mood has been lower lately. Consider adding more self-care activities.',
      );
    }

    if (data.leastActiveArea) {
      const areaNames: Record<SelfCareArea, string> = {
        MIND: 'mental wellness',
        BODY: 'physical activity',
        SOCIAL: 'social connections',
        SLEEP: 'sleep habits',
        NUTRITION: 'nutrition',
        CREATIVITY: 'creative activities',
        PRODUCTIVITY: 'productivity',
      };

      suggestions.push(
        `Try focusing more on ${areaNames[data.leastActiveArea]} this week.`,
      );
    }

    if (data.journalEntriesCount < data.periodDays / 2) {
      suggestions.push(
        'Journaling regularly can help improve self-awareness. Try writing more often!',
      );
    }

    if (data.breathingSessionsCount < 2) {
      suggestions.push(
        'Breathing exercises can reduce stress. Try adding them to your routine!',
      );
    }

    if (suggestions.length === 0) {
      suggestions.push('Great job maintaining your self-care routine! Keep it up!');
    }

    return suggestions;
  }
}

