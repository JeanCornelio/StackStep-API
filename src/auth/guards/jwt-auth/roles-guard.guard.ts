import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Request } from 'express';

import { User } from 'src/users/entities/user.entity';

export const META_ROLES = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get<string[]>(
      META_ROLES,
      context.getHandler(),
    );

    if (!validRoles) {
      return true;
    }

    if (validRoles.length === 0) {
      return true;
    }
    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user as User;

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    for (const role of validRoles) {
      if (user.roles.includes(role)) {
        return true;
      }
    }

    if (user.roles) {
      throw new UnauthorizedException('User does not have the required role');
    }
    return true;
  }
}
