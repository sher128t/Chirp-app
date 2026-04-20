import { IsString, IsUUID } from 'class-validator';

export class PurchaseItemDto {
  @IsString()
  @IsUUID()
  shopItemId: string;
}

