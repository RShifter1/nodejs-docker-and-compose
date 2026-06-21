import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from '../common/request-with-user.interface';

@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Request() req: RequestWithUser,
    @Body() createWishlistDto: CreateWishlistDto,
  ) {
    const userId = req.user?.id;
    return this.wishlistsService.create(userId, createWishlistDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.wishlistsService.findMany();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wishlistsService.findOne({ id: +id });
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWishlistDto: UpdateWishlistDto,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user?.id;
    return this.wishlistsService.updateOne(
      { id: +id },
      updateWishlistDto,
      userId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;
    return this.wishlistsService.removeOne({ id: +id }, userId);
  }
}
