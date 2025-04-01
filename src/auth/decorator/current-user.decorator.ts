import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserInfo {
  userId: number;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserInfo => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserInfo;
  },
);
