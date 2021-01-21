import { Response, Request, NextFunction } from 'express';

export interface RenderEngine {
  path: string;
  directory: string[];
  subdomain?: string;
}

export interface ErroHandler {
  (req: Request, res: Response, next: NextFunction, error: any): Response<any>;
}

export interface NotFoundHandler {
  (req: Request, res: Response, next: NextFunction): Promise<Response<any>>;
}

export interface Configuration {
  root: string;
  apiPrefix: string;
  debug: {
    log: Function;
    error: Function;
  };
  renderEngine: RenderEngine[] | RenderEngine;
  errorHandler?: ErroHandler;
  notFoundHandler?: NotFoundHandler;
}

export const defaultNotFoundHandler: NotFoundHandler = async (
  req,
  res
): Promise<Response<any>> => {
  return res.status(404).json({
    success: false,
    message: 'Route not found'
  });
};

export const defaultErrorHandler: ErroHandler = (
  req,
  res,
  next,
  error
): Response<any> => {
  // eslint-disable-next-line no-console
  console.error('Error caught!', error);
  return res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
};
