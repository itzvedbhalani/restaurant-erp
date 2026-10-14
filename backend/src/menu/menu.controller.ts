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
import { MenuService } from './menu.service';
import { CreateCategoryDto, CreateMenuItemDto, UpdateMenuItemDto, SaveRecipeDto } from './dto/menu.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Menu & Recipes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('menu')
export class MenuController {
  constructor(private menuService: MenuService) {}

  // Categories
  @Post('categories')
  @Roles('SUPER_ADMIN', 'OWNER', 'MENU_MANAGER')
  @ApiOperation({ summary: 'Create menu category' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.menuService.createCategory(dto);
  }

  @Get('categories/restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get all categories for a restaurant' })
  async findCategories(@Param('restaurantId') restaurantId: string) {
    return this.menuService.findCategoriesByRestaurant(restaurantId);
  }

  @Delete('categories/:id')
  @Roles('SUPER_ADMIN', 'OWNER', 'MENU_MANAGER')
  @ApiOperation({ summary: 'Delete category' })
  async deleteCategory(@Param('id') id: string) {
    return this.menuService.deleteCategory(id);
  }

  // Menu Items
  @Post('items')
  @Roles('SUPER_ADMIN', 'OWNER', 'MENU_MANAGER')
  @ApiOperation({ summary: 'Create menu item' })
  async createMenuItem(@Body() dto: CreateMenuItemDto) {
    return this.menuService.createMenuItem(dto);
  }

  @Get('items/restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get all menu items for a restaurant' })
  async findMenuItems(@Param('restaurantId') restaurantId: string) {
    return this.menuService.findMenuItemsByRestaurant(restaurantId);
  }

  @Put('items/:id')
  @Roles('SUPER_ADMIN', 'OWNER', 'MENU_MANAGER')
  @ApiOperation({ summary: 'Update menu item' })
  async updateMenuItem(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) {
    return this.menuService.updateMenuItem(id, dto);
  }

  @Delete('items/:id')
  @Roles('SUPER_ADMIN', 'OWNER', 'MENU_MANAGER')
  @ApiOperation({ summary: 'Delete menu item' })
  async deleteMenuItem(@Param('id') id: string) {
    return this.menuService.deleteMenuItem(id);
  }

  // Recipes
  @Post('items/:menuItemId/recipe')
  @Roles('SUPER_ADMIN', 'OWNER', 'MENU_MANAGER')
  @ApiOperation({ summary: 'Create or update recipe for a menu item' })
  async saveRecipe(
    @Param('menuItemId') menuItemId: string,
    @Body() dto: SaveRecipeDto,
  ) {
    return this.menuService.saveRecipe(menuItemId, dto);
  }

  @Get('items/:menuItemId/recipe')
  @ApiOperation({ summary: 'Get recipe for a menu item' })
  async findRecipe(@Param('menuItemId') menuItemId: string) {
    return this.menuService.findRecipeByMenuItem(menuItemId);
  }
}
