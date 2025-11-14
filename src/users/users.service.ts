import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { HandleErrorService } from 'src/common/services/handleError.service';

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
      return user;
    } catch (error) {
      this.handleErrorService.error(error);
    }
  }

  async findOneById(options: FindOneOptions<User> = {}) {
    return await this.userRepository.findOne({
      ...options,
    });
  }
}
