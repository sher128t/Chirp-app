import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JournalService } from './journal.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { UpdateJournalEntryDto } from './dto/update-journal-entry.dto';
import { GetJournalEntriesDto } from './dto/get-journal-entries.dto';

@Controller('journal')
@UseGuards(JwtAuthGuard)
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post()
  async createEntry(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateJournalEntryDto,
  ) {
    return this.journalService.createEntry(userId, dto);
  }

  @Get()
  async getEntries(
    @CurrentUser('id') userId: string,
    @Query() query: GetJournalEntriesDto,
  ) {
    return this.journalService.getEntries(userId, query);
  }

  @Get('tags')
  async getTags(@CurrentUser('id') userId: string) {
    return this.journalService.getUniqueTags(userId);
  }

  @Get(':id')
  async getEntry(
    @CurrentUser('id') userId: string,
    @Param('id') entryId: string,
  ) {
    return this.journalService.getEntryById(userId, entryId);
  }

  @Patch(':id')
  async updateEntry(
    @CurrentUser('id') userId: string,
    @Param('id') entryId: string,
    @Body() dto: UpdateJournalEntryDto,
  ) {
    return this.journalService.updateEntry(userId, entryId, dto);
  }

  @Delete(':id')
  async deleteEntry(
    @CurrentUser('id') userId: string,
    @Param('id') entryId: string,
  ) {
    return this.journalService.deleteEntry(userId, entryId);
  }
}

