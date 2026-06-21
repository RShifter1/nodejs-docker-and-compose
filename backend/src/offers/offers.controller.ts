import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { AuthGuard } from '@nestjs/passport';
import { Offer } from './offer.entity';
import { RequestWithUser } from '../common/request-with-user.interface';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Request() req: RequestWithUser,
    @Body() createOfferDto: CreateOfferDto,
  ) {
    const userId = req.user?.id;
    return this.offersService.create(userId, createOfferDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.offersService.findOne({ id: +id });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findMany(@Query() query: Partial<Offer>) {
    return this.offersService.findMany(query);
  }
}
