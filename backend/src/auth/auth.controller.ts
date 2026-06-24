import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { RequestWithUser } from '../common/request-with-user.interface';

@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post(['signup', 'signup/'])
  async signup(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return this.authService.login(user);
  }

  @UseGuards(AuthGuard('local'))
  @Post(['signin', 'signin/'])
  async signin(@Request() req: RequestWithUser) {
    return this.authService.login(req.user);
  }
}
