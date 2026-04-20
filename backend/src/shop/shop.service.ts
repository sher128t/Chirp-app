import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { InventoryService } from '../pet/inventory.service';
import { RewardsService } from '../rewards/rewards.service';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class ShopService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
    private readonly rewardsService: RewardsService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async getCatalog(userId: string) {
    const now = new Date();

    // Get all available shop items
    const shopItems = await this.prisma.shopItem.findMany({
      where: {
        availableFrom: { lte: now },
        OR: [{ availableTo: null }, { availableTo: { gte: now } }],
      },
      include: {
        item: true,
      },
      orderBy: [{ featured: 'desc' }, { item: { rarity: 'asc' } }],
    });

    // Get user's inventory to mark owned items
    const inventory = await this.prisma.inventoryItem.findMany({
      where: { userId },
      select: { itemId: true },
    });

    const ownedItemIds = new Set(inventory.map((i) => i.itemId));

    // Get user's subscription status
    const subscription = await this.subscriptionService.getSubscription(userId);
    const isPremium = subscription.tier === 'PREMIUM';

    return shopItems.map((si) => ({
      id: si.id,
      itemId: si.item.id,
      code: si.item.code,
      name: si.item.name,
      description: si.item.description,
      type: si.item.type,
      slot: si.item.slot,
      rarity: si.item.rarity,
      price: {
        currency: si.priceCurrency === 'SOFT' ? 'coins' : 'gems',
        amount: si.priceAmount,
      },
      premiumOnly: si.item.premiumOnly,
      canPurchase: !si.item.premiumOnly || isPremium,
      owned: ownedItemIds.has(si.item.id),
      featured: si.featured,
      metadata: si.item.metadataJson,
    }));
  }

  async purchaseItem(userId: string, shopItemId: string) {
    // Get shop item
    const shopItem = await this.prisma.shopItem.findUnique({
      where: { id: shopItemId },
      include: { item: true },
    });

    if (!shopItem) {
      throw new NotFoundException('Shop item not found');
    }

    // Check if already owned
    const alreadyOwned = await this.inventoryService.hasItem(userId, shopItem.itemId);
    if (alreadyOwned) {
      throw new BadRequestException('You already own this item');
    }

    // Check premium requirement
    if (shopItem.item.premiumOnly) {
      const subscription = await this.subscriptionService.getSubscription(userId);
      if (subscription.tier !== 'PREMIUM') {
        throw new BadRequestException('This item requires a premium subscription');
      }
    }

    // Check balance
    const hasBalance = await this.rewardsService.hasEnoughBalance(
      userId,
      shopItem.priceCurrency,
      shopItem.priceAmount,
    );

    if (!hasBalance) {
      throw new BadRequestException('Insufficient balance');
    }

    // Deduct currency
    await this.rewardsService.deductCurrency(
      userId,
      shopItem.priceCurrency,
      shopItem.priceAmount,
      `purchase:${shopItem.item.code}`,
    );

    // Add to inventory
    await this.inventoryService.addItemToInventory(userId, shopItem.itemId);

    return {
      success: true,
      item: {
        id: shopItem.item.id,
        code: shopItem.item.code,
        name: shopItem.item.name,
        type: shopItem.item.type,
        slot: shopItem.item.slot,
      },
    };
  }
}

