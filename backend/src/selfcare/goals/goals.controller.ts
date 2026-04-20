import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  async createGoal(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateGoalDto,
  ) {
    return this.goalsService.createGoal(userId, dto);
  }

  @Get()
  async getGoals(
    @CurrentUser('id') userId: string,
    @Query('includeArchived') includeArchived?: boolean,
  ) {
    return this.goalsService.getGoals(userId, includeArchived);
  }

  @Get(':id')
  async getGoal(
    @CurrentUser('id') userId: string,
    @Param('id') goalId: string,
  ) {
    return this.goalsService.getGoalById(userId, goalId);
  }

  @Patch(':id')
  async updateGoal(
    @CurrentUser('id') userId: string,
    @Param('id') goalId: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.goalsService.updateGoal(userId, goalId, dto);
  }

  @Post(':id/complete')
  async completeGoal(
    @CurrentUser('id') userId: string,
    @Param('id') goalId: string,
  ) {
    return this.goalsService.completeGoal(userId, goalId);
  }

  @Post(':id/uncomplete')
  async uncompleteGoal(
    @CurrentUser('id') userId: string,
    @Param('id') goalId: string,
  ) {
    return this.goalsService.uncompleteGoal(userId, goalId);
  }

  @Post(':id/archive')
  async archiveGoal(
    @CurrentUser('id') userId: string,
    @Param('id') goalId: string,
  ) {
    return this.goalsService.archiveGoal(userId, goalId);
  }

  @Delete(':id')
  async deleteGoal(
    @CurrentUser('id') userId: string,
    @Param('id') goalId: string,
  ) {
    return this.goalsService.deleteGoal(userId, goalId);
  }
}

