import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ShopService } from './shop.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PurchaseItemDto } from './dto/purchase-item.dto';

@Controller('shop')
@UseGuards(JwtAuthGuard)
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('catalog')
  async getCatalog(@CurrentUser('id') userId: string) {
    return this.shopService.getCatalog(userId);
  }

  @Post('purchase')
  async purchaseItem(
    @CurrentUser('id') userId: string,
    @Body() dto: PurchaseItemDto,
  ) {
    return this.shopService.purchaseItem(userId, dto.shopItemId);
  }
}

