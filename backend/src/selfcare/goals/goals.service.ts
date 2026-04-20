import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createGoal(userId: string, dto: CreateGoalDto) {
    return this.prisma.goal.create({
      data: {
        userId,
        title: dto.title,
        selfCareArea: dto.selfCareArea,
        scheduleType: dto.scheduleType || 'DAILY',
        scheduleDataJson: dto.scheduleData,
      },
    });
  }

  async getGoals(userId: string, includeArchived: boolean = false) {
    const where: any = { userId };

    if (!includeArchived) {
      where.archivedAt = null;
    }

    const goals = await this.prisma.goal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Get today's completions
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completions = await this.prisma.goalCompletion.findMany({
      where: {
        goalId: { in: goals.map((g) => g.id) },
        date: today,
      },
    });

    const completionMap = new Set(completions.map((c) => c.goalId));

    return goals.map((goal) => ({
      ...goal,
      completedToday: completionMap.has(goal.id),
    }));
  }

  async getGoalById(userId: string, goalId: string) {
    const goal = await this.prisma.goal.findFirst({
      where: {
        id: goalId,
        userId,
      },
      include: {
        completions: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    return goal;
  }

  async updateGoal(userId: string, goalId: string, dto: UpdateGoalDto) {
    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    return this.prisma.goal.update({
      where: { id: goalId },
      data: dto,
    });
  }

  async completeGoal(userId: string, goalId: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already completed today
    const existing = await this.prisma.goalCompletion.findUnique({
      where: {
        goalId_date: {
          goalId,
          date: today,
        },
      },
    });

    if (existing) {
      return { alreadyCompleted: true, completion: existing };
    }

    const completion = await this.prisma.goalCompletion.create({
      data: {
        goalId,
        date: today,
        value: true,
      },
    });

    // Emit event for quest/reward tracking
    this.eventEmitter.emit('selfcare.completed', {
      userId,
      action: 'goal_completion',
      selfCareArea: goal.selfCareArea,
      entityId: completion.id,
    });

    return { alreadyCompleted: false, completion };
  }

  async uncompleteGoal(userId: string, goalId: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.prisma.goalCompletion.deleteMany({
      where: {
        goalId,
        date: today,
      },
    });

    return { success: true };
  }

  async archiveGoal(userId: string, goalId: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    return this.prisma.goal.update({
      where: { id: goalId },
      data: { archivedAt: new Date() },
    });
  }

  async deleteGoal(userId: string, goalId: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    await this.prisma.goal.delete({
      where: { id: goalId },
    });

    return { success: true };
  }
}

