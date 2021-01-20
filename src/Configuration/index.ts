import { Response, Request } from 'express';

export interface RenderEngine {
  path: string;
  directory: string[];
  subdomain?: string;
}

export interface ErroHandler {
  (req: Request, res: Response, error: any): Response<any>;
}

export interface Configuration {
  root: string;
  restPrefix: string;
  debug: {
    log: Function;
    error: Function;
  };
  renderEngine: RenderEngine[] | RenderEngine;
  errorHandler?: ErroHandler;
}

export const defaultErrorHandler: ErroHandler = (
  req,
  res,
  error
): Response<any> => {
  // eslint-disable-next-line no-console
  console.error('Error caught!', error);
  return res.status(500).json({
    success: false,
    code: 'internal-error',
    message: 'Internal Server Error'
  });
};
