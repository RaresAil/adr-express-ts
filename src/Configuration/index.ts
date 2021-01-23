import express, { Response, Request, NextFunction } from 'express';
import { Options as RateLimitOptions } from 'express-rate-limit';

type ExpressStaticParams = Parameters<typeof express.static>;

export interface StaticFiles {
  middlewares?: (string | Function)[];
  directory: string[];
  subdomain?: string;
  path: string;
  options?: ExpressStaticParams[1];
  rateLimitOptions?: RateLimitOptions;
}

export interface StaticFilesSubdomain extends StaticFiles {
  subdomain: string;
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
 * @property {?(Array<module:Configuration.StaticFilesSubdomain> | module:Configuration.StaticFiles)} staticFiles
 * Static files is used to serve static files
 * @property {?module:Configuration.ErroHandler} errorHandler All the thrown errors and the ones
 * from next() will be caught in the errorHandler.
 * @property {?module:Configuration.NotFoundHandler} notFoundHandler This handler is used when the
 * route is not found.
 */
/**
 * @static
 * @member ConfigurationDebug
 * @type {ConfigurationDebug}
 *
 * Use an empty function to disable the logger.
 *
 * @property {?Function} log If undefined, the default logger will be used.
 * @property {?Function} error If undefined, the default logger will be used.
 */
/**
 * @static
 * @member StaticFiles
 * @type {StaticFiles}
 *
 * @property {string} path The path that will be used to serve the files
 * @property {Array<string>} directory The root directory for the served files
 * @property {?string} subdomain A subdomain is optional here
 * @property {?Array.<string | Function>} middlewares Middlewares
 * @property {?serveStatic.ServeStaticOptions} options Serve Static Options
 * @property {?rateLimit.Options} rateLimitOptions To disable the rate limiter, set to undefined
 */
/**
 * @static
 * @member StaticFilesSubdomain
 * @type {StaticFilesSubdomain}
 *
 * @property {string} path The path that will be used to serve the files
 * @property {Array<string>} directory The root directory for the served files
 * @property {string} subdomain The subdomain is required.
 * @property {?Array.<string | Function>} middlewares Middlewares
 * @property {?serveStatic.ServeStaticOptions} options Serve Static Options
 * @property {?rateLimit.Options} rateLimitOptions To disable the rate limiter, set to undefined
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
