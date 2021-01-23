import { Response, Request, NextFunction } from 'express';

export interface StaticFiles {
  path: string;
  directory: string[];
  subdomain?: string;
  middlewares?: (string | Function)[];
}

export interface StaticFilesSubdomain {
  path: string;
  directory: string[];
  subdomain: string;
  middlewares?: (string | Function)[];
}

export interface ErroHandler {
  (req: Request, res: Response, next: NextFunction, error: any): Response<any>;
}

export interface NotFoundHandler {
  (req: Request, res: Response, next: NextFunction): Promise<Response<any>>;
}

export interface ConfigurationDebug {
  log?: Function;
  error?: Function;
}

export interface Configuration {
  root: string;
  apiPrefix: string;
  debug: ConfigurationDebug;
  staticFiles?: StaticFilesSubdomain[] | StaticFiles;
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

/**
 * @module Configuration
 */
/**
 * @static
 * @member Configuration
 * @type {Configuration}
 *
 * @property {string} root The root of the app, for development that is ./src/, this should always be '__dirname'
 * @property {string} apiPrefix The prefix which will be used for the api e.g. /api
 * @property {module:Configuration.ConfigurationDebug} debug The debug functions
 * @property {Array<module:Configuration.StaticFiles> | module:Configuration.StaticFiles | undefined} staticFiles
 * @property {module:Configuration.ErroHandler | undefined} errorHandler All the thrown errors and the ones
 * from next() will be caught in the errorHandler.
 * @property {module:Configuration.NotFoundHandler | undefined} notFoundHandler This handler is used when the
 * route is not found.
 */
/**
 * @static
 * @member ConfigurationDebug
 * @type {ConfigurationDebug}
 *
 * @property {Function | undefined} log
 * @property {Function | undefined} error
 */
/**
 * @static
 * @member StaticFiles
 * @type {StaticFiles}
 *
 * @property {string} path
 * @property {Array<string>} directory
 * @property {string | undefined} subdomain
 */
/**
 * @static
 * @member NotFoundHandler
 * @type {Promise<Response<any>>}
 *
 * @property {Express.Request} req The Express's Request
 * @property {Express.Response} res The Express's Response
 * @property {Express.NextFunction} next The Express's Next Function
 */
/**
 * @static
 * @member ErroHandler
 * @type {Response<any>}
 *
 * @property {Express.Request} req The Express's Request
 * @property {Express.Response} res The Express's Response
 * @property {Express.NextFunction} next The Express's Next Function
 * @property {any} error The error that was caught
 */
