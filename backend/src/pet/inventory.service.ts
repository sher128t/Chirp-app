import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getInventory(userId: string) {
    const items = await this.prisma.inventoryItem.findMany({
      where: { userId },
      include: {
        item: true,
      },
      orderBy: [
        { equipped: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return items.map((inv) => ({
      id: inv.id,
      itemId: inv.item.id,
      code: inv.item.code,
      name: inv.item.name,
      description: inv.item.description,
      type: inv.item.type,
      slot: inv.item.slot,
      rarity: inv.item.rarity,
      equipped: inv.equipped,
      metadata: inv.item.metadataJson,
      acquiredAt: inv.createdAt,
    }));
  }

  async equipItem(userId: string, inventoryItemId: string) {
    // Get the inventory item
    const inventoryItem = await this.prisma.inventoryItem.findFirst({
      where: {
        id: inventoryItemId,
        userId,
      },
      include: {
        item: true,
      },
    });

    if (!inventoryItem) {
      throw new NotFoundException('Item not found in inventory');
    }

    // Unequip any item in the same slot
    await this.prisma.inventoryItem.updateMany({
      where: {
        userId,
        item: {
          slot: inventoryItem.item.slot,
        },
        equipped: true,
      },
      data: {
        equipped: false,
      },
    });

    // Equip the new item
    const updated = await this.prisma.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { equipped: true },
      include: {
        item: true,
      },
    });

    return {
      id: updated.id,
      itemId: updated.item.id,
      code: updated.item.code,
      name: updated.item.name,
      slot: updated.item.slot,
      equipped: updated.equipped,
      metadata: updated.item.metadataJson,
    };
  }

  async unequipItem(userId: string, inventoryItemId: string) {
    const inventoryItem = await this.prisma.inventoryItem.findFirst({
      where: {
        id: inventoryItemId,
        userId,
      },
    });

    if (!inventoryItem) {
      throw new NotFoundException('Item not found in inventory');
    }

    const updated = await this.prisma.inventoryItem.update({
      where: { id: inventoryItemId },
      data: { equipped: false },
      include: {
        item: true,
      },
    });

    return {
      id: updated.id,
      itemId: updated.item.id,
      code: updated.item.code,
      name: updated.item.name,
      slot: updated.item.slot,
      equipped: updated.equipped,
    };
  }

  async addItemToInventory(userId: string, itemId: string): Promise<void> {
    // Check if user already has this item
    const existing = await this.prisma.inventoryItem.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId,
        },
      },
    });

    if (existing) {
      // User already owns this item, nothing to do
      return;
    }

    await this.prisma.inventoryItem.create({
      data: {
        userId,
        itemId,
        equipped: false,
      },
    });
  }

  async hasItem(userId: string, itemId: string): Promise<boolean> {
    const item = await this.prisma.inventoryItem.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId,
        },
      },
    });

    return !!item;
  }
}

