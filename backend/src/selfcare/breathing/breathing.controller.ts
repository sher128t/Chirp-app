import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { BreathingService } from './breathing.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CompleteBreathingDto } from './dto/complete-breathing.dto';

@Controller('breathing')
@UseGuards(JwtAuthGuard)
export class BreathingController {
  constructor(private readonly breathingService: BreathingService) {}

  @Get('exercises')
  getExercises() {
    return this.breathingService.getExercises();
  }

  @Get('exercises/:code')
  getExercise(@Param('code') code: string) {
    return this.breathingService.getExercise(code);
  }

  @Post('complete')
  async completeSession(
    @CurrentUser('id') userId: string,
    @Body() dto: CompleteBreathingDto,
  ) {
    return this.breathingService.completeSession(userId, dto);
  }

  @Get('sessions')
  async getRecentSessions(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.breathingService.getRecentSessions(userId, limit || 10);
  }

  @Get('stats')
  async getSessionStats(
    @CurrentUser('id') userId: string,
    @Query('days') days?: number,
  ) {
    return this.breathingService.getSessionStats(userId, days || 7);
  }
}

