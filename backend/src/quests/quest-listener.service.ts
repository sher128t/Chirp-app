import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { QuestsService } from './quests.service';
import { StreaksService } from './streaks.service';
import { PetService } from '../pet/pet.service';
import { SelfCareArea } from '@prisma/client';

interface SelfCareEvent {
  userId: string;
  action: string;
  selfCareArea: string;
  entityId: string;
}

@Injectable()
export class QuestListenerService {
  constructor(
    private readonly questsService: QuestsService,
    private readonly streaksService: StreaksService,
    @Inject(forwardRef(() => PetService))
    private readonly petService: PetService,
  ) {}

  @OnEvent('selfcare.completed')
  async handleSelfCareCompleted(event: SelfCareEvent) {
    console.log('Self-care event received:', event);

    // Update quest progress
    await this.questsService.updateQuestProgress(
      event.userId,
      event.action,
      event.selfCareArea,
    );

    // Update streak if valid self-care area
    if (event.selfCareArea && Object.values(SelfCareArea).includes(event.selfCareArea as SelfCareArea)) {
      await this.streaksService.updateStreak(
        event.userId,
        event.selfCareArea as SelfCareArea,
      );
    }

    // Give base rewards for completing self-care action
    const baseRewards = this.getBaseRewards(event.action);

    if (baseRewards.xp > 0) {
      await this.petService.addXp(event.userId, baseRewards.xp);
    }

    if (baseRewards.energy > 0) {
      await this.petService.addEnergy(event.userId, baseRewards.energy);
    }

    if (baseRewards.happiness > 0) {
      await this.petService.addHappiness(event.userId, baseRewards.happiness);
    }
  }

  private getBaseRewards(action: string): { xp: number; energy: number; happiness: number } {
    switch (action) {
      case 'mood_entry':
        return { xp: 5, energy: 3, happiness: 2 };
      case 'goal_completion':
        return { xp: 10, energy: 5, happiness: 3 };
      case 'journal_entry':
        return { xp: 15, energy: 3, happiness: 5 };
      case 'breathing_session':
        return { xp: 10, energy: 8, happiness: 5 };
      default:
        return { xp: 5, energy: 2, happiness: 1 };
    }
  }
}

