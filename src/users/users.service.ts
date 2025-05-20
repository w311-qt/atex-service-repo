import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: [
        'id',
        'name',
        'email',
        'role',
        'department',
        'position',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'name',
        'email',
        'role',
        'department',
        'position',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.findOneByEmail(createUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const newUser = this.usersRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      const savedUser = await this.usersRepository.save(newUser);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = savedUser;
      return result as User;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error; // Пробрасываем ошибку конфликта
      }
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Если обновляем email, проверим, не занят ли он
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findOneByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.usersRepository.update(id, updateUserDto);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async findTechnicians(): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: UserRole.TECHNICIAN, isActive: true },
      select: ['id', 'name', 'email', 'department', 'position'],
      order: { name: 'ASC' },
    });
  }
}