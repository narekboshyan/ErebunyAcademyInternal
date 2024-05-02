import { NextApiRequest, NextApiResponse } from 'next';
import {
  createMiddlewareDecorator,
  NextFunction,
  UnauthorizedException,
} from 'next-api-decorators';
import { getToken } from 'next-auth/jwt';
import { UserResolver } from '../resolvers/user.resolver';

export const AuthMiddleware = createMiddlewareDecorator(
  async (req: NextApiRequest, res: NextApiResponse, next: NextFunction) => {
    const token = await getToken({ req, secret: process.env.JWT_SECRET });

    if (!token || !token.email) {
      throw new UnauthorizedException();
    }

    const user = await UserResolver.findUserByEmail(token.email);

    if (!user) {
      throw new UnauthorizedException();
    }

    next();
  },
);
