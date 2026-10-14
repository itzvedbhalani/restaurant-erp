import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStaffDto {
  @ApiProperty({ example: '+1234567890' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 45000 })
  @IsNotEmpty()
  @IsNumber()
  salary: number;

  @ApiProperty({ example: 'ACTIVE' })
  @IsNotEmpty()
  @IsString()
  status: string; // ACTIVE, INACTIVE, LEAVE
}

export class ClockInDto {
  @ApiProperty({ example: '2026-07-02T09:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  clockInTime: string;

  @ApiProperty({ example: 'PRESENT' })
  @IsNotEmpty()
  @IsString()
  status: string; // PRESENT, LATE, HALF_DAY
}

export class ClockOutDto {
  @ApiProperty({ example: '2026-07-02T18:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  clockOutTime: string;
}

export class CreateStaffDto {
  @ApiProperty({ example: 'a-temporary-password' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'New Waiter' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'WAITER', description: 'Cannot be OWNER or SUPER_ADMIN through this endpoint' })
  @IsNotEmpty()
  @IsString()
  roleName: string;

  @ApiProperty({ example: '1234567890' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 25000, required: false })
  @IsOptional()
  @IsNumber()
  salary?: number;

  @ApiProperty({
    example: 'restaurant-uuid',
    required: false,
    description: 'Required for SUPER_ADMIN callers; ignored for OWNER callers (their own restaurant is used automatically)',
  })
  @IsOptional()
  @IsString()
  restaurantId?: string;
}

export class CreateRoleDto {
  @ApiProperty({ example: 'CASHIER' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Handles checkout payments' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: ['process_payment', 'read_orders'] })
  @IsNotEmpty()
  permissionNames: string[];
}
