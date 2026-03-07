// auth/strategies/github.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { CreateGithubUserDto } from 'src/users/dto/create-github-user.dto';
import { UserFrom, UserRoles, UserState } from 'src/enums/user';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService,
    private userService: UsersService,
  ) {
    super({
      clientID: configService.get('GITHUB_CLIENT_ID') as string,
      clientSecret: configService.get('GITHUB_CLIENT_SECRET') as string,
      callbackURL: configService.get('GITHUB_REDIRECT_URI') as string,
      scope: ['repo, user:email, read:user'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: { username: string; photos: { value: string }[] },
  ) {
    const { username, photos } = profile;

    const { email } = await this.userService.getGithubUserEmail(accessToken);

    const user: CreateGithubUserDto = {
      username,
      avatarUrl: photos[0].value,
      email,
      roles: [UserRoles.USER],
      from: UserFrom.GITHUB,
      state: UserState.ACTIVE,
    };

    return user;
  }
}
