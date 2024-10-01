import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Los decoradores son funciones
//createParamDecorator espera como argumento un callback
export const RawHeaders = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.rawHeaders;
  },
);
