import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ example: 'menu-item-uuid' })
  @IsNotEmpty()
  @IsString()
  menuItemId: string;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 'No onions', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'table-uuid', required: false })
  @IsOptional()
  @IsString()
  tableId?: string;

  @ApiProperty({ example: 'waiter-uuid', required: false })
  @IsOptional()
  @IsString()
  waiterId?: string;

  @ApiProperty({ example: 'restaurant-uuid' })
  @IsNotEmpty()
  @IsString()
  restaurantId: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ example: 'Add extra napkins', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ example: 'PREPARING' }) // NEW, PREPARING, READY, SERVED, COMPLETED, CANCELLED
  @IsNotEmpty()
  @IsString()
  status: string;
}

export class RecordPaymentDto {
  @ApiProperty({ example: 45.50 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'UPI' }) // CASH, UPI, CARD
  @IsNotEmpty()
  @IsString()
  method: string;

  @ApiProperty({ example: 0.0, required: false })
  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @ApiProperty({ example: 'TXN123456789', required: false })
  @IsOptional()
  @IsString()
  transactionId?: string;
}
