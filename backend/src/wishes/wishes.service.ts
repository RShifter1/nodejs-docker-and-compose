import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Wish } from './wish.entity';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
  ) {}

  async create(ownerId: number, createWishDto: CreateWishDto): Promise<Wish> {
    const wish = this.wishesRepository.create({
      ...createWishDto,
      owner: { id: ownerId },
      raised: 0,
      copied: 0,
    });
    return this.wishesRepository.save(wish);
  }

  async findOne(query: Partial<Wish>): Promise<Wish> {
    const wish = await this.wishesRepository.findOne({
      where: query,
      relations: ['owner', 'offers.user'],
    });
    if (!wish) throw new NotFoundException('Подарок не найден');
    return wish;
  }

  async findMany(query: FindOptionsWhere<Wish> = {}): Promise<Wish[]> {
    return this.wishesRepository.find({ where: query, relations: ['owner'] });
  }

  async updateOne(
    query: Partial<Wish>,
    updateWishDto: UpdateWishDto,
    userId: number,
  ): Promise<Wish> {
    const wish = await this.findOne(query);
    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Нельзя редактировать чужой подарок');
    }
    if (updateWishDto.price && wish.offers && wish.offers.length > 0) {
      throw new ForbiddenException(
        'Нельзя изменить стоимость, так как уже есть желающие скинуться',
      );
    }
    Object.assign(wish, updateWishDto);
    return this.wishesRepository.save(wish);
  }

  async removeOne(query: Partial<Wish>, userId: number): Promise<void> {
    const wish = await this.findOne(query);
    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Нельзя удалить чужой подарок');
    }
    await this.wishesRepository.remove(wish);
  }

  async getLastWishes(): Promise<Wish[]> {
    return this.wishesRepository.find({
      order: { createdAt: 'DESC' },
      take: 40,
      relations: ['owner'],
    });
  }

  async getPopularWishes(): Promise<Wish[]> {
    return this.wishesRepository.find({
      order: { copied: 'DESC' },
      take: 20,
      relations: ['owner'],
    });
  }

  async copyWish(wishId: number, userId: number): Promise<Wish> {
    const original = await this.findOne({ id: wishId });
    original.copied += 1;
    await this.wishesRepository.save(original);
    const copy = this.wishesRepository.create({
      name: original.name,
      link: original.link,
      image: original.image,
      price: original.price,
      description: original.description,
      owner: { id: userId },
      raised: 0,
      copied: 0,
    });
    return this.wishesRepository.save(copy);
  }

  async updateRaised(wishId: number, newRaised: number): Promise<Wish> {
    const wish = await this.findOne({ id: wishId });
    wish.raised = newRaised;
    return this.wishesRepository.save(wish);
  }

  async getWishById(
    wishId: number,
    currentUserId: number | null = null,
  ): Promise<Wish> {
    const wish = await this.wishesRepository.findOne({
      where: { id: wishId },
      relations: ['owner', 'offers.user'],
    });
    if (!wish) throw new NotFoundException('Подарок не найден');

    if (!currentUserId || wish.owner.id !== currentUserId) {
      wish.offers = wish.offers.filter((offer) => !offer.hidden);
    }
    return wish;
  }
}
