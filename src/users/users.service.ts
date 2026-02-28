import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { HandleErrorService } from 'src/common/services/handleError.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly handleErrorService: HandleErrorService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const user = this.userRepository.create(createUserDto);
      await this.userRepository.save(user);

      const newUser = await this.userRepository.findOne({
        where: { id: user.id },
        select: ['id', 'email', 'roles', 'state', 'from', 'createdAt'],
      });

      return newUser;
    } catch (error) {
      this.handleErrorService.error(error);
    }
  }

  async findOneById(options: FindOneOptions<User> = {}) {
    return await this.userRepository.findOne({
      ...options,
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      await this.userRepository.update(id, updateUserDto);

      return await this.userRepository.findOne({
        where: { id },
        select: ['id', 'email', 'roles', 'state', 'from', 'createdAt'],
      });
    } catch (error) {
      this.handleErrorService.error(error);
    }
  }
}
