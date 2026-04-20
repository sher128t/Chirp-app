import { Module } from '@nestjs/common';
import { MoodsController } from './moods/moods.controller';
import { MoodsService } from './moods/moods.service';
import { GoalsController } from './goals/goals.controller';
import { GoalsService } from './goals/goals.service';
import { JournalController } from './journal/journal.controller';
import { JournalService } from './journal/journal.service';
import { BreathingController } from './breathing/breathing.controller';
import { BreathingService } from './breathing/breathing.service';

@Module({
  controllers: [MoodsController, GoalsController, JournalController, BreathingController],
  providers: [MoodsService, GoalsService, JournalService, BreathingService],
  exports: [MoodsService, GoalsService, JournalService, BreathingService],
})
export class SelfcareModule {}

