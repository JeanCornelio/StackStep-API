import { BadRequestException, Injectable } from '@nestjs/common';

import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginAuthDto } from './dto/login-auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { type Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUser: CreateUserDto) {
    const user = await this.userService.create(createUser);
    return user;
  }

  async login(loginAuthDto: LoginAuthDto, res: Response) {
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
      const refreshToken = this.getJwtToken(payload);
      //TODO: generar el refresh token

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return {
        data: { ...payload, access_token: this.getJwtToken(payload) },
      };
    } else {
      throw new BadRequestException('Invalid credentials');
    }
  }

  refreshToken(token: string) {
    const { id, roles } = this.verifyToken(token);

    const newToken = this.getJwtToken({ id, roles });

    return {
      data: { access_token: newToken },
    };
  }

  private isTokenValid(token: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);

      return payload;
    } catch {
      return false;
    }
  }

  verifyToken(token: string): JwtPayload {
    try {
      const payload = this.isTokenValid(token);

      if (!payload) {
        throw new BadRequestException('Invalid token');
      }

      return payload;
    } catch {
      throw new BadRequestException('Invalid token');
    }
  }

  logOut(res: Response) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    return { data: { message: 'Logged out successfully' } };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
