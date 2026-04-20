import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMoodDto } from './dto/create-mood.dto';
import { GetMoodsDto } from './dto/get-moods.dto';

@Injectable()
export class MoodsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createMood(userId: string, dto: CreateMoodDto) {
    const mood = await this.prisma.moodEntry.create({
      data: {
        userId,
        moodScore: dto.moodScore,
        moodLabel: dto.moodLabel,
        tags: dto.tags || [],
        notes: dto.notes,
      },
    });

    // Emit event for quest/reward tracking
    this.eventEmitter.emit('selfcare.completed', {
      userId,
      action: 'mood_entry',
      selfCareArea: 'MIND',
      entityId: mood.id,
    });

    return mood;
  }

  async getMoods(userId: string, query: GetMoodsDto) {
    const where: any = { userId };

    if (query.from) {
      where.createdAt = { gte: new Date(query.from) };
    }

    if (query.to) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(query.to),
      };
    }

    const moods = await this.prisma.moodEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: query.limit || 50,
    });

    return moods;
  }

  async getMoodById(userId: string, moodId: string) {
    return this.prisma.moodEntry.findFirst({
      where: {
        id: moodId,
        userId,
      },
    });
  }

  async getMoodStats(userId: string, days: number = 7) {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const moods = await this.prisma.moodEntry.findMany({
      where: {
        userId,
        createdAt: { gte: from },
      },
      orderBy: { createdAt: 'asc' },
    });

    const avgScore = moods.length > 0
      ? moods.reduce((sum, m) => sum + m.moodScore, 0) / moods.length
      : 0;

    const moodCounts = moods.reduce((acc, m) => {
      acc[m.moodLabel] = (acc[m.moodLabel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEntries: moods.length,
      averageScore: Math.round(avgScore * 10) / 10,
      moodDistribution: moodCounts,
      trend: this.calculateTrend(moods),
    };
  }

  private calculateTrend(moods: { moodScore: number; createdAt: Date }[]): string {
    if (moods.length < 3) return 'insufficient_data';

    const halfLength = Math.floor(moods.length / 2);
    const firstHalf = moods.slice(0, halfLength);
    const secondHalf = moods.slice(halfLength);

    const firstAvg = firstHalf.reduce((sum, m) => sum + m.moodScore, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, m) => sum + m.moodScore, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;

    if (diff > 0.5) return 'improving';
    if (diff < -0.5) return 'declining';
    return 'stable';
  }
}

