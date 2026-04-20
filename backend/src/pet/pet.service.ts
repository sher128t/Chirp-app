import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { UpdatePetDto } from './dto/update-pet.dto';

// XP required per level (simple linear progression for MVP)
const XP_PER_LEVEL = 100;
const MAX_LEVEL = 100;

@Injectable()
export class PetService {
  constructor(private readonly prisma: PrismaService) {}

  async getPet(userId: string) {
    const pet = await this.prisma.pet.findUnique({
      where: { userId },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    // Get equipped items
    const equippedItems = await this.prisma.inventoryItem.findMany({
      where: {
        userId,
        equipped: true,
      },
      include: {
        item: true,
      },
    });

    return {
      ...pet,
      xpToNextLevel: this.getXpToNextLevel(pet.level),
      equippedItems: equippedItems.map((inv) => ({
        id: inv.item.id,
        code: inv.item.code,
        name: inv.item.name,
        type: inv.item.type,
        slot: inv.item.slot,
        metadata: inv.item.metadataJson,
      })),
    };
  }

  async updatePet(userId: string, dto: UpdatePetDto) {
    const pet = await this.prisma.pet.findUnique({
      where: { userId },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    return this.prisma.pet.update({
      where: { userId },
      data: dto,
    });
  }

  async addXp(userId: string, xpAmount: number): Promise<{ leveledUp: boolean; newLevel: number }> {
    const pet = await this.prisma.pet.findUnique({
      where: { userId },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    let newXp = pet.xp + xpAmount;
    let newLevel = pet.level;
    let leveledUp = false;

    // Check for level up
    while (newXp >= this.getXpToNextLevel(newLevel) && newLevel < MAX_LEVEL) {
      newXp -= this.getXpToNextLevel(newLevel);
      newLevel++;
      leveledUp = true;
    }

    await this.prisma.pet.update({
      where: { userId },
      data: {
        xp: newXp,
        level: newLevel,
      },
    });

    return { leveledUp, newLevel };
  }

  async addEnergy(userId: string, amount: number): Promise<number> {
    const pet = await this.prisma.pet.findUnique({
      where: { userId },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    const newEnergy = Math.min(100, Math.max(0, pet.energy + amount));

    await this.prisma.pet.update({
      where: { userId },
      data: { energy: newEnergy },
    });

    return newEnergy;
  }

  async addHappiness(userId: string, amount: number): Promise<number> {
    const pet = await this.prisma.pet.findUnique({
      where: { userId },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    const newHappiness = Math.min(100, Math.max(0, pet.happiness + amount));

    await this.prisma.pet.update({
      where: { userId },
      data: { happiness: newHappiness },
    });

    return newHappiness;
  }

  private getXpToNextLevel(level: number): number {
    return XP_PER_LEVEL * level;
  }
}

