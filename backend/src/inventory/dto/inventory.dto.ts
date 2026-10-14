import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInventoryItemDto {
  @ApiProperty({ example: 'Cheese' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 10.5 })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiProperty({ example: 'kg' })
  @IsNotEmpty()
  @IsString()
  unit: string; // kg, liters, pcs, pack

  @ApiProperty({ example: 2.0 })
  @IsOptional()
  @IsNumber()
  threshold?: number; // Low stock alert limit

  @ApiProperty({ example: 'restaurant-uuid' })
  @IsNotEmpty()
  @IsString()
  restaurantId: string;
}

export class UpdateInventoryItemDto {
  @ApiProperty({ example: 'Cheese' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'kg' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ example: 3.0 })
  @IsOptional()
  @IsNumber()
  threshold?: number;
}

export class CreateTransactionDto {
  @ApiProperty({ example: 'inventory-item-uuid' })
  @IsNotEmpty()
  @IsString()
  inventoryItemId: string;

  @ApiProperty({ example: 'STOCK_IN' })
  @IsNotEmpty()
  @IsString()
  type: string; // STOCK_IN, STOCK_OUT, CONSUMED, WASTAGE

  @ApiProperty({ example: 5.0 })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 'Purchased from local market' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateSupplierDto {
  @ApiProperty({ example: 'Fresh Dairy Co' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiProperty({ example: '1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'john@freshdairy.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'Industrial Area Phase 1' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'restaurant-uuid' })
  @IsNotEmpty()
  @IsString()
  restaurantId: string;
}
