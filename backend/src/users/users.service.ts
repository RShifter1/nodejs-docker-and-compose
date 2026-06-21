import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });
    if (existingUser) {
      throw new ConflictException(
        'Пользователь с таким email или username уже существует',
      );
    }

    const hashedPassword = await this.hashPassword(createUserDto.password);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      about: createUserDto.about ?? 'Пока ничего не рассказал о себе',
      avatar: createUserDto.avatar ?? 'https://i.pravatar.cc/300',
    });
    return this.usersRepository.save(user);
  }

  async findOne(query: Partial<User>): Promise<User> {
    const user = await this.usersRepository.findOne({ where: query });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  async findMany(query: Partial<User>): Promise<User[]> {
    return this.usersRepository.find({ where: query });
  }

  async updateOne(
    query: Partial<User>,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findOne(query);

    if (updateUserDto.email || updateUserDto.username) {
      const conflict = await this.usersRepository.findOne({
        where: [
          { email: updateUserDto.email },
          { username: updateUserDto.username },
        ],
      });
      if (conflict && conflict.id !== user.id) {
        throw new ConflictException('Email или username уже заняты');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async findUserWithWishes(userId: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['wishes'],
    });
    if (!user) throw new NotFoundException('Пользователь не найден');
    return user;
  }

  async removeOne(query: Partial<User>): Promise<void> {
    const user = await this.findOne(query);
    await this.usersRepository.remove(user);
  }

  async searchByQuery(searchString: string): Promise<User[]> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.username ILIKE :search', { search: `%${searchString}%` })
      .orWhere('user.email ILIKE :search', { search: `%${searchString}%` })
      .getMany();
  }
}
