import { BadRequestException, Injectable } from '@nestjs/common';

import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginAuthDto } from './dto/login-auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUser: CreateUserDto) {
    const res = await this.userService.create(createUser);
    return res;
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findOneById({
      where: { email },
    });
    if (user && user.password === password) {
      console.log(user);
    }

    return null;
  }

  async login(loginAuthDto: LoginAuthDto) {
    const { email, password } = loginAuthDto;

    const user = await this.userService.findOneById({
      where: { email: email },
      select: ['id', 'password', 'roles'],
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const checkPassword = await bcrypt.compare(password, user?.password);

    const payload = {
      id: user.id,
      roles: user.roles,
    };

    if (checkPassword) {
      return {
        ...payload,
        access_token: this.getJwtToken(payload),
      };
    }
  }

  private getJwtToken(payload: JwtPayload) {
    //Firmar el JWT
    const token = this.jwtService.sign(payload);

    return token;
  }
}
