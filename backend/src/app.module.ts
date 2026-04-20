import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PetModule } from './pet/pet.module';
import { SelfcareModule } from './selfcare/selfcare.module';
import { QuestsModule } from './quests/quests.module';
import { RewardsModule } from './rewards/rewards.module';
import { ShopModule } from './shop/shop.module';
import { InsightsModule } from './insights/insights.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Event emitter for internal events
    EventEmitterModule.forRoot(),

    // Scheduling for cron jobs
    ScheduleModule.forRoot(),

    // Database
    PrismaModule,

    // Redis
    RedisModule,

    // Feature modules
    AuthModule,
    UsersModule,
    PetModule,
    SelfcareModule,
    QuestsModule,
    RewardsModule,
    ShopModule,
    InsightsModule,
    SubscriptionModule,
    NotificationsModule,
  ],
})
export class AppModule {}

