import { Controller, Get, Patch, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PetService } from './pet.service';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdatePetDto } from './dto/update-pet.dto';
import { EquipItemDto } from './dto/equip-item.dto';

@Controller('pet')
@UseGuards(JwtAuthGuard)
export class PetController {
  constructor(
    private readonly petService: PetService,
    private readonly inventoryService: InventoryService,
  ) {}

  @Get()
  async getPet(@CurrentUser('id') userId: string) {
    return this.petService.getPet(userId);
  }

  @Patch()
  async updatePet(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePetDto,
  ) {
    return this.petService.updatePet(userId, dto);
  }

  @Get('inventory')
  async getInventory(@CurrentUser('id') userId: string) {
    return this.inventoryService.getInventory(userId);
  }

  @Post('inventory/equip')
  async equipItem(
    @CurrentUser('id') userId: string,
    @Body() dto: EquipItemDto,
  ) {
    return this.inventoryService.equipItem(userId, dto.inventoryItemId);
  }

  @Post('inventory/unequip')
  async unequipItem(
    @CurrentUser('id') userId: string,
    @Body() dto: EquipItemDto,
  ) {
    return this.inventoryService.unequipItem(userId, dto.inventoryItemId);
  }
}

