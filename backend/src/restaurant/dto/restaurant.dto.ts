import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEmail, MinLength, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRestaurantDto {
  @ApiProperty({ example: 'My Tasty Restaurant' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '123 Food Street, New York' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ example: '+1234567890' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: '27AAAAA1111A1Z1', required: false })
  @IsOptional()
  @IsString()
  gstNumber?: string;
}

export class OnboardRestaurantDto extends CreateRestaurantDto {
  @ApiProperty({ example: 'owner@myrestaurant.com', description: "The new restaurant owner's login email" })
  @IsEmail()
  ownerEmail: string;

  @ApiProperty({ example: 'Restaurant Owner Name' })
  @IsNotEmpty()
  @IsString()
  ownerName: string;

  @ApiProperty({ example: 'a-temporary-password', description: 'Owner should change this after first login' })
  @IsNotEmpty()
  @MinLength(6)
  ownerPassword: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsOptional()
  @IsString()
  ownerPhone?: string;
}

export class UpdateRestaurantStatusDto {
  @ApiProperty({ example: 'SUSPENDED', enum: ['ACTIVE', 'SUSPENDED'] })
  @IsNotEmpty()
  @IsIn(['ACTIVE', 'SUSPENDED'])
  status: string;
}

export class CreateTableDto {
  @ApiProperty({ example: 'Table 5' })
  @IsNotEmpty()
  @IsString()
  number: string;

  @ApiProperty({ example: 4 })
  @IsNotEmpty()
  @IsNumber()
  capacity: number;

  @ApiProperty({ example: 'AVAILABLE', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: 'restaurant-uuid' })
  @IsNotEmpty()
  @IsString()
  restaurantId: string;
}

export class UpdateTableStatusDto {
  @ApiProperty({ example: 'OCCUPIED' })
  @IsNotEmpty()
  @IsString()
  status: string;
}
