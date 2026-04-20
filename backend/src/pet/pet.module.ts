import { Module, forwardRef } from '@nestjs/common';
import { PetController } from './pet.controller';
import { PetService } from './pet.service';
import { InventoryService } from './inventory.service';
import { RewardsModule } from '../rewards/rewards.module';

@Module({
  imports: [forwardRef(() => RewardsModule)],
  controllers: [PetController],
  providers: [PetService, InventoryService],
  exports: [PetService, InventoryService],
})
export class PetModule {}

