import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

// Los decoradores son funciones
//createParamDecorator espera como argumento un callback
export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    if (!user)
      throw new InternalServerErrorException('User not found (Request)');

    return !data ? user : user[data];
  },
);
