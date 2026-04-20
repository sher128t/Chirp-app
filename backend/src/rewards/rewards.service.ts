import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Currency, TransactionType } from '@prisma/client';

@Injectable()
export class RewardsService {
  constructor(private readonly prisma: PrismaService) {}

  async getWallet(userId: string) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          userId,
          softBalance: 0,
          hardBalance: 0,
        },
      });
    }

    return {
      coins: wallet.softBalance,
      gems: wallet.hardBalance,
    };
  }

  async getTransactions(userId: string, limit: number = 50) {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      currency: t.currency === 'SOFT' ? 'coins' : 'gems',
      source: t.source,
      createdAt: t.createdAt,
    }));
  }

  async addCurrency(userId: string, currency: Currency, amount: number, source: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Update wallet
    const updateData =
      currency === 'SOFT'
        ? { softBalance: wallet.softBalance + amount }
        : { hardBalance: wallet.hardBalance + amount };

    await this.prisma.wallet.update({
      where: { userId },
      data: updateData,
    });

    // Create transaction record
    await this.prisma.transaction.create({
      data: {
        userId,
        type: TransactionType.QUEST_REWARD,
        amount,
        currency,
        source,
      },
    });

    return this.getWallet(userId);
  }

  async deductCurrency(
    userId: string,
    currency: Currency,
    amount: number,
    source: string,
    type: TransactionType = TransactionType.PURCHASE,
  ) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const currentBalance = currency === 'SOFT' ? wallet.softBalance : wallet.hardBalance;

    if (currentBalance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Update wallet
    const updateData =
      currency === 'SOFT'
        ? { softBalance: wallet.softBalance - amount }
        : { hardBalance: wallet.hardBalance - amount };

    await this.prisma.wallet.update({
      where: { userId },
      data: updateData,
    });

    // Create transaction record
    await this.prisma.transaction.create({
      data: {
        userId,
        type,
        amount: -amount,
        currency,
        source,
      },
    });

    return this.getWallet(userId);
  }

  async hasEnoughBalance(userId: string, currency: Currency, amount: number): Promise<boolean> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return false;
    }

    const balance = currency === 'SOFT' ? wallet.softBalance : wallet.hardBalance;
    return balance >= amount;
  }
}

