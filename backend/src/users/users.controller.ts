import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  Request,
  UseGuards,
  Query,
  Body,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import { WishesService } from '../wishes/wishes.service';
import { RequestWithUser } from '../common/request-with-user.interface';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly wishesService: WishesService,
  ) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findUserWithWishes(+id);
  }

  @Get()
  findMany(@Query() query: Partial<User>) {
    return this.usersService.findMany(query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMe(@Request() req: RequestWithUser) {
    return this.usersService.findOne({ id: req.user.id });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me/wishes')
  async getMyWishes(@Request() req: RequestWithUser) {
    return this.wishesService.findMany({ owner: { id: req.user.id } });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('search')
  search(@Query('query') query: string) {
    if (!query) return [];
    return this.usersService.searchByQuery(query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: RequestWithUser,
  ) {
    if (+id !== req.user.id) {
      throw new ForbiddenException('Нельзя редактировать чужой профиль');
    }
    return this.usersService.updateOne({ id: +id }, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    if (+id !== req.user.id) {
      throw new ForbiddenException('Нельзя удалить чужой профиль');
    }
    return this.usersService.removeOne({ id: +id });
  }
}
