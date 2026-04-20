import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CompleteBreathingDto } from './dto/complete-breathing.dto';

// Predefined breathing exercises
export const BREATHING_EXERCISES: Record<string, {
  code: string;
  name: string;
  description: string;
  steps: { action: string; duration: number }[];
  cycles: number;
  totalDuration: number;
}> = {
  box: {
    code: 'box',
    name: 'Box Breathing',
    description: 'Inhale 4s, hold 4s, exhale 4s, hold 4s',
    steps: [
      { action: 'inhale', duration: 4 },
      { action: 'hold', duration: 4 },
      { action: 'exhale', duration: 4 },
      { action: 'hold', duration: 4 },
    ],
    cycles: 4,
    totalDuration: 64,
  },
  '478': {
    code: '478',
    name: '4-7-8 Relaxing Breath',
    description: 'Inhale 4s, hold 7s, exhale 8s',
    steps: [
      { action: 'inhale', duration: 4 },
      { action: 'hold', duration: 7 },
      { action: 'exhale', duration: 8 },
    ],
    cycles: 4,
    totalDuration: 76,
  },
  relaxing: {
    code: 'relaxing',
    name: 'Simple Relaxation',
    description: 'Inhale 4s, exhale 6s',
    steps: [
      { action: 'inhale', duration: 4 },
      { action: 'exhale', duration: 6 },
    ],
    cycles: 6,
    totalDuration: 60,
  },
  energizing: {
    code: 'energizing',
    name: 'Energizing Breath',
    description: 'Quick inhale 2s, quick exhale 2s',
    steps: [
      { action: 'inhale', duration: 2 },
      { action: 'exhale', duration: 2 },
    ],
    cycles: 10,
    totalDuration: 40,
  },
};

@Injectable()
export class BreathingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  getExercises() {
    return Object.values(BREATHING_EXERCISES);
  }

  getExercise(code: string) {
    return BREATHING_EXERCISES[code] || null;
  }

  async completeSession(userId: string, dto: CompleteBreathingDto) {
    const exercise = BREATHING_EXERCISES[dto.exerciseType];
    
    const session = await this.prisma.breathingSession.create({
      data: {
        userId,
        exerciseType: dto.exerciseType,
        durationSecs: dto.durationSecs || (exercise?.totalDuration || 60),
      },
    });

    // Emit event for quest/reward tracking
    this.eventEmitter.emit('selfcare.completed', {
      userId,
      action: 'breathing_session',
      selfCareArea: 'MIND',
      entityId: session.id,
    });

    return {
      session,
      rewards: {
        xp: 10,
        energy: 5,
      },
    };
  }

  async getRecentSessions(userId: string, limit: number = 10) {
    return this.prisma.breathingSession.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: limit,
    });
  }

  async getSessionStats(userId: string, days: number = 7) {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const sessions = await this.prisma.breathingSession.findMany({
      where: {
        userId,
        completedAt: { gte: from },
      },
    });

    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, s) => sum + s.durationSecs, 0);

    const byExercise = sessions.reduce((acc, s) => {
      acc[s.exerciseType] = (acc[s.exerciseType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSessions,
      totalDurationMins: Math.round(totalDuration / 60),
      sessionsByExercise: byExercise,
    };
  }
}

