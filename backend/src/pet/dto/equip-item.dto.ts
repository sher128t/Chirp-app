import { IsString, IsUUID } from 'class-validator';

export class EquipItemDto {
  @IsString()
  @IsUUID()
  inventoryItemId: string;
}

