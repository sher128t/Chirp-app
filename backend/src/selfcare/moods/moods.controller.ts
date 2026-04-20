import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { MoodsService } from './moods.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CreateMoodDto } from './dto/create-mood.dto';
import { GetMoodsDto } from './dto/get-moods.dto';

@Controller('moods')
@UseGuards(JwtAuthGuard)
export class MoodsController {
  constructor(private readonly moodsService: MoodsService) {}

  @Post()
  async createMood(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateMoodDto,
  ) {
    return this.moodsService.createMood(userId, dto);
  }

  @Get()
  async getMoods(
    @CurrentUser('id') userId: string,
    @Query() query: GetMoodsDto,
  ) {
    return this.moodsService.getMoods(userId, query);
  }

  @Get('stats')
  async getMoodStats(
    @CurrentUser('id') userId: string,
    @Query('days') days?: number,
  ) {
    return this.moodsService.getMoodStats(userId, days || 7);
  }
}

