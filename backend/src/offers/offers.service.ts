import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './offer.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { WishesService } from '../wishes/wishes.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    private wishesService: WishesService,
    private usersService: UsersService,
  ) {}

  async create(userId: number, createOfferDto: CreateOfferDto): Promise<Offer> {
    const wish = await this.wishesService.findOne({
      id: createOfferDto.itemId,
    });

    if (wish.owner.id === userId) {
      throw new ForbiddenException('Нельзя скидываться на свой подарок');
    }

    if (createOfferDto.amount <= 0) {
      throw new BadRequestException('Сумма должна быть больше 0');
    }

    const newRaised = Number(wish.raised) + Number(createOfferDto.amount);
    if (newRaised > wish.price) {
      throw new BadRequestException(
        'Сумма сбора не может превышать стоимость подарка',
      );
    }

    const user = await this.usersService.findOne({ id: userId });

    const offer = this.offersRepository.create({
      amount: createOfferDto.amount,
      hidden: createOfferDto.hidden ?? false,
      user,
      item: wish,
    });

    wish.raised = newRaised;
    await this.wishesService.updateRaised(wish.id, newRaised);

    return this.offersRepository.save(offer);
  }

  async findOne(query: Partial<Offer>): Promise<Offer> {
    const offer = await this.offersRepository.findOne({
      where: query,
      relations: ['user', 'item'],
    });
    if (!offer) throw new NotFoundException('Заявка не найдена');
    return offer;
  }

  async findMany(query: Partial<Offer> = {}): Promise<Offer[]> {
    return this.offersRepository.find({
      where: query,
      relations: ['user', 'item'],
    });
  }
}
