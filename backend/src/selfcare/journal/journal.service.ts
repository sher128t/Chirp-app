import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { UpdateJournalEntryDto } from './dto/update-journal-entry.dto';
import { GetJournalEntriesDto } from './dto/get-journal-entries.dto';

@Injectable()
export class JournalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createEntry(userId: string, dto: CreateJournalEntryDto) {
    const entry = await this.prisma.journalEntry.create({
      data: {
        userId,
        title: dto.title,
        content: dto.content,
        tags: dto.tags || [],
      },
    });

    // Emit event for quest/reward tracking
    this.eventEmitter.emit('selfcare.completed', {
      userId,
      action: 'journal_entry',
      selfCareArea: 'MIND',
      entityId: entry.id,
    });

    return entry;
  }

  async getEntries(userId: string, query: GetJournalEntriesDto) {
    const where: any = { userId };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.tags && query.tags.length > 0) {
      where.tags = { hasSome: query.tags };
    }

    const entries = await this.prisma.journalEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: query.limit || 50,
      skip: query.offset || 0,
    });

    return entries;
  }

  async getEntryById(userId: string, entryId: string) {
    const entry = await this.prisma.journalEntry.findFirst({
      where: {
        id: entryId,
        userId,
      },
    });

    if (!entry) {
      throw new NotFoundException('Journal entry not found');
    }

    return entry;
  }

  async updateEntry(userId: string, entryId: string, dto: UpdateJournalEntryDto) {
    const entry = await this.prisma.journalEntry.findFirst({
      where: { id: entryId, userId },
    });

    if (!entry) {
      throw new NotFoundException('Journal entry not found');
    }

    return this.prisma.journalEntry.update({
      where: { id: entryId },
      data: dto,
    });
  }

  async deleteEntry(userId: string, entryId: string) {
    const entry = await this.prisma.journalEntry.findFirst({
      where: { id: entryId, userId },
    });

    if (!entry) {
      throw new NotFoundException('Journal entry not found');
    }

    await this.prisma.journalEntry.delete({
      where: { id: entryId },
    });

    return { success: true };
  }

  async getUniqueTags(userId: string) {
    const entries = await this.prisma.journalEntry.findMany({
      where: { userId },
      select: { tags: true },
    });

    const allTags = entries.flatMap((e) => e.tags);
    const uniqueTags = [...new Set(allTags)];

    return uniqueTags.sort();
  }
}

