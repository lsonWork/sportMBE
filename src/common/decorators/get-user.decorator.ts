import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Role } from 'src/common/enum/Role';

// Định nghĩa type user lấy từ JWT validate
export interface JwtUser {
  userId: string;
  fullName: string;
  email: string;
  role: Role;
}

export const GetUser = createParamDecorator(
  (data: keyof JwtUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as JwtUser;

    // Nếu truyền data (ví dụ: @GetUser('userId')), thì return field đó
    return data ? user?.[data] : user;
  },
);
