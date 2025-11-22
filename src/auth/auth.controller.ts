import { Controller, Post, Body, Get, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';

import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Auth } from './decorators/auth.decorator';
import { GetUser } from './decorators/get-user.decorator';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('login')
  loging(
    @Body() loginAuthDto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(loginAuthDto, res);
  }

  @Auth()
  @Get('profile')
  getProfile(@GetUser() user: CreateAuthDto) {
    return { data: { user } };
  }

  @Post('refresh')
  refresh(@Req() request: Request) {
    const token: string = request.cookies['refresh_token'] as string;

    return this.authService.refreshToken(token);
  }

  @Post('logout')
  logOut(@Res({ passthrough: true }) res: Response) {
    return this.authService.logOut(res);
  }
}
