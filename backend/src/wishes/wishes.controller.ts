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
import { AuthGuard } from '@nestjs/passport';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { RequestWithUser } from '../common/request-with-user.interface';
@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Request() req, @Body() createWishDto: CreateWishDto) {
    const userId = req.user.id;
    return this.wishesService.create(userId, createWishDto);
  }

  @Get('last')
  getLast() {
    return this.wishesService.getLastWishes();
  }

  @Get('popular')
  getPopular() {
    return this.wishesService.getPopularWishes();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    const userId = req.user?.id;
    return this.wishesService.getWishById(+id, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWishDto: UpdateWishDto,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user.id;
    return this.wishesService.updateOne({ id: +id }, updateWishDto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    const userId = req.user.id;
    return this.wishesService.removeOne({ id: +id }, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/copy')
  copy(@Param('id') id: string, @Request() req: RequestWithUser) {
    const userId = req.user.id;
    return this.wishesService.copyWish(+id, userId);
  }
}
