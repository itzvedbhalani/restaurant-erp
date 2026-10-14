import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, CreateMenuItemDto, UpdateMenuItemDto, SaveRecipeDto } from './dto/menu.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  // Category operations
  async createCategory(dto: CreateCategoryDto) {
    return this.prisma.menuCategory.create({
      data: dto,
    });
  }

  async findCategoriesByRestaurant(restaurantId: string) {
    return this.prisma.menuCategory.findMany({
      where: { restaurantId },
      include: {
        menuItems: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async deleteCategory(id: string) {
    return this.prisma.menuCategory.delete({
      where: { id },
    });
  }

  // Menu Item operations
  async createMenuItem(dto: CreateMenuItemDto) {
    return this.prisma.menuItem.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        imageUrl: dto.imageUrl,
        taxRate: dto.taxRate ?? 5.0,
        categoryId: dto.categoryId,
        isAvailable: true,
      },
    });
  }

  async findMenuItemsByRestaurant(restaurantId: string) {
    return this.prisma.menuItem.findMany({
      where: {
        category: { restaurantId },
      },
      include: {
        category: true,
        recipe: {
          include: {
            recipeIngredients: {
              include: { inventoryItem: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async updateMenuItem(id: string, dto: UpdateMenuItemDto) {
    return this.prisma.menuItem.update({
      where: { id },
      data: dto,
    });
  }

  async deleteMenuItem(id: string) {
    return this.prisma.menuItem.delete({
      where: { id },
    });
  }

  // Recipe operations
  async saveRecipe(menuItemId: string, dto: SaveRecipeDto) {
    // Check if MenuItem exists
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: { recipe: true },
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    let recipe = menuItem.recipe;

    if (!recipe) {
      // Create new recipe
      recipe = await this.prisma.recipe.create({
        data: {
          menuItemId,
          description: dto.description,
        },
      });
    } else {
      // Update recipe description
      recipe = await this.prisma.recipe.update({
        where: { id: recipe.id },
        data: { description: dto.description },
      });

      // Clear existing ingredients for update
      await this.prisma.recipeIngredient.deleteMany({
        where: { recipeId: recipe.id },
      });
    }

    // Create recipe ingredients
    if (dto.ingredients && dto.ingredients.length > 0) {
      await this.prisma.recipeIngredient.createMany({
        data: dto.ingredients.map((ing) => ({
          recipeId: recipe.id,
          inventoryItemId: ing.inventoryItemId,
          quantityNeeded: ing.quantityNeeded,
        })),
      });
    }

    return this.findRecipeByMenuItem(menuItemId);
  }

  async findRecipeByMenuItem(menuItemId: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { menuItemId },
      include: {
        recipeIngredients: {
          include: {
            inventoryItem: true,
          },
        },
      },
    });

    if (!recipe) {
      return null;
    }
    return recipe;
  }
}
