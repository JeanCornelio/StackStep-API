import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { LoginAuthDto } from './dto/login-auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { type Response } from 'express';
import { UserState } from 'src/enums/user';
import { EmailService } from 'src/common/services/email.service';
import { User } from 'src/users/entities/user.entity';
import { CreateGithubUserDto } from 'src/users/dto/create-github-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async create(createUser: CreateUserDto) {
    const user = await this.userService.create(createUser);

    if (!user || !user.email) {
      throw new BadRequestException('User could not be created');
    }

    await this.sendActivationEmail(user);

    return {
      data: { user },
    };
  }

  async sendActivationEmail(user: User) {
    //TODO: generate activation token and send email with activation link
    const { id, roles } = user;

    const token = this.getJwtToken({ id, roles }, { expiresIn: '15m' });

    try {
      await this.emailService.sendMail({
        from: 'StackStep - <stackStep@noreplay.com>',
        to: user.email,
        subject: 'Welcome to StackStep!',
        text: 'Thank you for registering at StackStep. Please activate your account by clicking the link sent to your email.',
        html: `<p>Thank you for registering at StackStep. Please activate your account by clicking the link sent to your email.</p>
      
            <a href="http://localhost:5173/verify-account/${token}">Activate Account</a>
             `,
      });
    } catch (error) {
      //TODO: handle email sending error, maybe retry or log the error for later analysis
      console.log(error);
    }
  }

  async login(loginAuthDto: LoginAuthDto, res: Response) {
    const { email, password } = loginAuthDto;

    const user = await this.userService.findOneById({
      where: { email: email },
      select: ['id', 'password', 'roles', 'state'],
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    if (user?.state === UserState.PENDING_ACTIVATION) {
      throw new UnauthorizedException(
        'The account is not activated yet, please check your email to activate it',
      );
    }

    if (user?.state === UserState.DISABLED) {
      throw new UnauthorizedException('The account has been disabled');
    }

    const checkPassword = await bcrypt.compare(password, user?.password);

    const payload = {
      id: user.id,
      roles: user.roles,
    };

    if (checkPassword) {
      const refreshToken = this.getJwtToken(payload);
      this.setCookies(res, refreshToken);
      return {
        data: { ...payload, access_token: this.getJwtToken(payload) },
      };
    } else {
      throw new BadRequestException('Invalid credentials');
    }
  }

  private setCookies(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
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

  async activeAccount(token: string) {
    const { id } = this.verifyToken(token);

    const user = await this.userService.findOneById({
      where: { id },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.state === UserState.ACTIVE) {
      throw new ConflictException('The account is already activated');
    }

    await this.userService.update(id, { state: UserState.ACTIVE });

    return {
      data: { message: 'Account activated successfully' },
    };
  }

  verifyToken(token: string): JwtPayload {
    try {
      const tokenValidated = this.isTokenValid(token);

      if (!tokenValidated) {
        throw new BadRequestException('Invalid token');
      }

      return tokenValidated;
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

  private getJwtToken(payload: JwtPayload, options?: JwtSignOptions) {
    const token = this.jwtService.sign(payload, options ?? {});
    return token;
  }

  async loginWithGithub(payload: CreateGithubUserDto, res: Response) {
    try {
      const user =
        (await this.userService.findOneById({
          where: { email: payload.email },
        })) ?? (await this.userService.createOauthUser(payload));

      const refreshToken = this.getJwtToken({
        id: user?.id,
        roles: user?.roles,
      } as JwtPayload);
      this.setCookies(res, refreshToken);

      res.redirect(`http://localhost:5173/login/callback/${refreshToken}`);
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error getting OAuth token');
    }
  }
}
