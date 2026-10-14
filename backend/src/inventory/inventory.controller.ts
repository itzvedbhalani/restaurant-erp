import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import {
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  CreateTransactionDto,
  CreateSupplierDto,
} from './dto/inventory.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Inventory & Suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  // Items
  @Post('items')
  @Roles('SUPER_ADMIN', 'OWNER', 'INVENTORY_STAFF')
  @ApiOperation({ summary: 'Create a raw material item' })
  async createItem(@Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.createInventoryItem(dto);
  }

  @Get('items/restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get all raw materials of a restaurant' })
  async findItems(@Param('restaurantId') restaurantId: string) {
    return this.inventoryService.findItemsByRestaurant(restaurantId);
  }

  @Put('items/:id')
  @Roles('SUPER_ADMIN', 'OWNER', 'INVENTORY_STAFF')
  @ApiOperation({ summary: 'Update raw material settings' })
  async updateItem(@Param('id') id: string, @Body() dto: UpdateInventoryItemDto) {
    return this.inventoryService.updateInventoryItem(id, dto);
  }

  @Delete('items/:id')
  @Roles('SUPER_ADMIN', 'OWNER', 'INVENTORY_STAFF')
  @ApiOperation({ summary: 'Delete raw material item' })
  async deleteItem(@Param('id') id: string) {
    return this.inventoryService.deleteInventoryItem(id);
  }

  // Transactions
  @Post('transactions')
  @Roles('SUPER_ADMIN', 'OWNER', 'INVENTORY_STAFF')
  @ApiOperation({ summary: 'Record stock transaction (STOCK_IN, STOCK_OUT, WASTAGE)' })
  async createTransaction(@Body() dto: CreateTransactionDto) {
    return this.inventoryService.createTransaction(dto);
  }

  @Get('transactions/item/:itemId')
  @ApiOperation({ summary: 'Get transaction history of a raw material' })
  async findTransactions(@Param('itemId') itemId: string) {
    return this.inventoryService.findTransactionsByItem(itemId);
  }

  // Suppliers
  @Post('suppliers')
  @Roles('SUPER_ADMIN', 'OWNER', 'INVENTORY_STAFF')
  @ApiOperation({ summary: 'Register a supplier vendor' })
  async createSupplier(@Body() dto: CreateSupplierDto) {
    return this.inventoryService.createSupplier(dto);
  }

  @Get('suppliers/restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get suppliers list' })
  async findSuppliers(@Param('restaurantId') restaurantId: string) {
    return this.inventoryService.findSuppliersByRestaurant(restaurantId);
  }

  @Put('suppliers/:id')
  @Roles('SUPER_ADMIN', 'OWNER', 'INVENTORY_STAFF')
  @ApiOperation({ summary: 'Update supplier details' })
  async updateSupplier(@Param('id') id: string, @Body() dto: CreateSupplierDto) {
    return this.inventoryService.updateSupplier(id, dto);
  }

  @Delete('suppliers/:id')
  @Roles('SUPER_ADMIN', 'OWNER', 'INVENTORY_STAFF')
  @ApiOperation({ summary: 'Delete supplier' })
  async deleteSupplier(@Param('id') id: string) {
    return this.inventoryService.deleteSupplier(id);
  }
}
