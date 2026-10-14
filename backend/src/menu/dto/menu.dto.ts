import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Starters' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Appetizers and quick bites' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'restaurant-uuid' })
  @IsNotEmpty()
  @IsString()
  restaurantId: string;
}

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Garlic Bread' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Toasted bread with garlic butter and herbs' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 12.99 })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({ example: 'https://images.unsplash.com/...', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 5.0, required: false })
  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @ApiProperty({ example: 'category-uuid' })
  @IsNotEmpty()
  @IsString()
  categoryId: string;
}

export class UpdateMenuItemDto {
  @ApiProperty({ example: 'Garlic Bread' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Toasted bread with garlic butter' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 13.99 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ example: 'https://images.unsplash.com/...', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ example: 5.0 })
  @IsOptional()
  @IsNumber()
  taxRate?: number;
}

export class IngredientRequirementDto {
  @ApiProperty({ example: 'inventory-item-uuid' })
  @IsNotEmpty()
  @IsString()
  inventoryItemId: string;

  @ApiProperty({ example: 0.15 }) // e.g. 150 grams / 0.15 kg
  @IsNotEmpty()
  @IsNumber()
  quantityNeeded: number;
}

export class SaveRecipeDto {
  @ApiProperty({ example: 'Recipe description/instructions' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [IngredientRequirementDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredientRequirementDto)
  ingredients: IngredientRequirementDto[];
}
