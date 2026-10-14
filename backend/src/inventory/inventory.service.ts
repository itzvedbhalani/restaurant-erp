import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  CreateTransactionDto,
  CreateSupplierDto,
} from './dto/inventory.dto';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private realtime: RealtimeGateway,
  ) {}

  // Inventory Items
  async createInventoryItem(dto: CreateInventoryItemDto) {
    const item = await this.prisma.inventoryItem.create({
      data: {
        name: dto.name,
        quantity: dto.quantity ?? 0.0,
        unit: dto.unit,
        threshold: dto.threshold ?? 5.0,
        restaurantId: dto.restaurantId,
      },
    });
    this.realtime.sendInventoryUpdate(item);
    return item;
  }

  async findItemsByRestaurant(restaurantId: string) {
    return this.prisma.inventoryItem.findMany({
      where: { restaurantId },
      orderBy: { name: 'asc' },
    });
  }

  async updateInventoryItem(id: string, dto: UpdateInventoryItemDto) {
    const item = await this.prisma.inventoryItem.update({
      where: { id },
      data: dto,
    });
    this.realtime.sendInventoryUpdate(item);
    return item;
  }

  async deleteInventoryItem(id: string) {
    const item = await this.prisma.inventoryItem.delete({
      where: { id },
    });
    this.realtime.sendInventoryUpdate({ ...item, deleted: true });
    return item;
  }

  // Stock Transactions
  async createTransaction(dto: CreateTransactionDto) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id: dto.inventoryItemId },
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    let newQty = item.quantity;
    if (dto.type === 'STOCK_IN') {
      newQty += dto.quantity;
    } else if (dto.type === 'STOCK_OUT' || dto.type === 'CONSUMED' || dto.type === 'WASTAGE') {
      if (newQty < dto.quantity) {
        throw new BadRequestException(`Insufficient stock. Current: ${newQty} ${item.unit}`);
      }
      newQty -= dto.quantity;
    } else {
      throw new BadRequestException('Invalid transaction type');
    }

    // Update item quantity
    const updatedItem = await this.prisma.inventoryItem.update({
      where: { id: item.id },
      data: { quantity: newQty },
    });
    this.realtime.sendInventoryUpdate(updatedItem);

    // Create transaction log
    const transaction = await this.prisma.inventoryTransaction.create({
      data: {
        inventoryItemId: dto.inventoryItemId,
        type: dto.type,
        quantity: dto.quantity,
        notes: dto.notes,
      },
    });

    // Check low stock and create notification if needed
    if (newQty <= item.threshold) {
      // Find restaurant setting/owner or staff to alert
      const staffs = await this.prisma.staff.findMany({
        where: { restaurantId: item.restaurantId },
        include: { user: true },
      });

      for (const staff of staffs) {
        await this.prisma.notification.create({
          data: {
            userId: staff.userId,
            title: 'Low Stock Alert',
            message: `${item.name} is running low (${newQty.toFixed(2)} ${item.unit} remaining).`,
            type: 'LOW_STOCK',
          },
        });
      }
    }

    return transaction;
  }

  async findTransactionsByItem(inventoryItemId: string) {
    return this.prisma.inventoryTransaction.findMany({
      where: { inventoryItemId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Suppliers
  async createSupplier(dto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: dto,
    });
  }

  async findSuppliersByRestaurant(restaurantId: string) {
    return this.prisma.supplier.findMany({
      where: { restaurantId },
      orderBy: { name: 'asc' },
    });
  }

  async updateSupplier(id: string, dto: CreateSupplierDto) {
    return this.prisma.supplier.update({
      where: { id },
      data: dto,
    });
  }

  async deleteSupplier(id: string) {
    return this.prisma.supplier.delete({
      where: { id },
    });
  }
}
