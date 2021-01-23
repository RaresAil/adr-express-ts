import { Request, Response, NextFunction } from 'express';
import { RouteCallback } from '../@types/Router';

import { ErroHandler } from '../Configuration';

export const AsyncCallback = (fn: RouteCallback, errorHandler: ErroHandler) => (
  req: Request,
  res: Response,
  next: NextFunction
) =>
  Promise.resolve(fn(req, res, next)).catch((e) => {
    return errorHandler(req, res, next, e);
  });

export const APIMiddleware = (
  fn: RouteCallback,
  prefix: string,
  mode: 'api' | 'render'
) => (req: Request, res: Response, next: NextFunction) => {
  if (
    (req.path.startsWith(prefix) && mode === 'api') ||
    (!req.path.startsWith(prefix) && mode === 'render')
  ) {
    return fn(req, res, next);
  }

  return next();
};
