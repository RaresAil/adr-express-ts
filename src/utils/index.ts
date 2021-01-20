import { Request, Response, NextFunction } from 'express';

import { ErroHandler } from '../Configuration';

export const AsyncMiddleware = (middleware: any, errorHandler: ErroHandler) => (
  req: Request,
  res: Response,
  next: NextFunction
) =>
  Promise.resolve(middleware(req, res, next)).catch((e) => {
    return errorHandler(req, res, e);
  });

export const AsyncRoute = (route: any, errorHandler: ErroHandler) => (
  req: Request,
  res: Response
) =>
  Promise.resolve(route(req, res)).catch((e) => {
    return errorHandler(req, res, e);
  });