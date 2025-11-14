import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import {
  RolesGuard,
  META_ROLES,
} from 'src/auth/guards/jwt-auth/roles-guard.guard';

export const Auth = (...args: string[]) => {
  return applyDecorators(
    SetMetadata(META_ROLES, args),
    UseGuards(AuthGuard('jwt'), RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
};
