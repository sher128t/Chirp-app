import { Module } from '@nestjs/common';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { PetModule } from '../pet/pet.module';
import { RewardsModule } from '../rewards/rewards.module';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [PetModule, RewardsModule, SubscriptionModule],
  controllers: [ShopController],
  providers: [ShopService],
  exports: [ShopService],
})
export class ShopModule {}

