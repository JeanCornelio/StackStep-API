import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { HandleErrorService } from 'src/common/services/handleError.service';
import { UpdateUserDto } from './dto/update-user.dto';

import { UserFrom, UserRoles, UserState } from 'src/enums/user';
import { GithubUser } from './interfaces/github-user-profile.interfaces';
import { CreateGithubUserDto } from './dto/create-github-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly handleErrorService: HandleErrorService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const newUser = await this.createUser(createUserDto);
      return newUser;
    } catch (error) {
      this.handleErrorService.error(error);
    }
  }

  async createOauthUser(createGithubUserDto: CreateGithubUserDto) {
    try {
      const newUser = await this.createUser(createGithubUserDto);

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

  async getGithubUserEmail(accessToken: string) {
    const res = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const emails = (await res.json()) as {
      email: string;
      primary: boolean;
    }[];

    const primaryEmail = emails.find((email) => email.primary);

    if (!primaryEmail) {
      throw new BadRequestException(
        'Primary email not found in GitHub profile',
      );
    }

    return primaryEmail;
  }

  private createUser = async (dto: CreateGithubUserDto | CreateUserDto) => {
    const user = this.userRepository.create(dto);
    await this.userRepository.save(user);

    const newUser = await this.userRepository.findOne({
      where: { id: user.id },
      select: ['id', 'email', 'roles', 'state', 'from', 'createdAt'],
    });

    return newUser;
  };
}
