import { Module, forwardRef } from '@nestjs/common';
import { QuestsController } from './quests.controller';
import { QuestsService } from './quests.service';
import { StreaksService } from './streaks.service';
import { QuestListenerService } from './quest-listener.service';
import { PetModule } from '../pet/pet.module';
import { RewardsModule } from '../rewards/rewards.module';

@Module({
  imports: [forwardRef(() => PetModule), forwardRef(() => RewardsModule)],
  controllers: [QuestsController],
  providers: [QuestsService, StreaksService, QuestListenerService],
  exports: [QuestsService, StreaksService],
})
export class QuestsModule {}

