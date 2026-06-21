import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './wishlist.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { WishesService } from '../wishes/wishes.service';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistsRepository: Repository<Wishlist>,
    private wishesService: WishesService,
  ) {}

  async create(
    userId: number,
    createWishlistDto: CreateWishlistDto,
  ): Promise<Wishlist> {
    const items = await Promise.all(
      createWishlistDto.itemsId.map((id) => this.wishesService.findOne({ id })),
    );
    const wishlist = this.wishlistsRepository.create({
      ...createWishlistDto,
      owner: { id: userId },
      items,
    });
    return this.wishlistsRepository.save(wishlist);
  }

  async findOne(query: Partial<Wishlist>): Promise<Wishlist> {
    const wishlist = await this.wishlistsRepository.findOne({
      where: query,
      relations: ['owner', 'items'],
    });
    if (!wishlist) throw new NotFoundException('Подборка не найдена');
    return wishlist;
  }

  async findMany(query: Partial<Wishlist> = {}): Promise<Wishlist[]> {
    return this.wishlistsRepository.find({
      where: query,
      relations: ['owner', 'items'],
    });
  }

  async updateOne(
    query: Partial<Wishlist>,
    updateWishlistDto: UpdateWishlistDto,
    userId: number,
  ): Promise<Wishlist> {
    const wishlist = await this.findOne(query);
    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('Нельзя редактировать чужую подборку');
    }
    if (updateWishlistDto.itemsId) {
      const newItems = await Promise.all(
        updateWishlistDto.itemsId.map((id) =>
          this.wishesService.findOne({ id }),
        ),
      );
      wishlist.items = newItems;
      delete updateWishlistDto.itemsId;
    }
    Object.assign(wishlist, updateWishlistDto);
    return this.wishlistsRepository.save(wishlist);
  }

  async removeOne(query: Partial<Wishlist>, userId: number): Promise<void> {
    const wishlist = await this.findOne(query);
    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException('Нельзя удалить чужую подборку');
    }
    await this.wishlistsRepository.remove(wishlist);
  }
}
