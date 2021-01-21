import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction as ExpressNext
} from 'express';

export interface InjectedClass {
  onReady(): Promise<void>;
}

export interface InjectedEntity {
  onLoad(): Promise<void>;
}

export interface Middleware {
  middleware(
    req: ExpressRequest,
    res: ExpressResponse,
    next: ExpressNext
  ): Promise<any>;
}

/**
 * Interface for classes that are middlewares.
 *
 * @abstract
 * @classdesc The Middleware interface. This class can't be instantiated.
 * @class ~Middleware
 * @hideconstructor
 * @memberof module:Injector
 */

/**
 * The middleware function.
 *
 * @public
 * @method ~Middleware.middleware
 * @memberof module:Injector
 *
 * @param {Express.Request} req Express's Request
 * @param {Express.Response} res Express's Response
 * @param {Express.NextFunction} next Express's Next Function
 * @returns {Promise<any>}
 *
 * @example <caption>Example usage of [Middleware]{@link module:Injector~Middleware}.</caption>
 * [\@Inject]{@link module:Injector.Inject}
 * export default class AuthentificationMiddleware implements [Middleware]{@link module:Injector~Middleware} {
 *    public async [middleware]{@link module:Injector~Middleware.middleware}(
 *      req: Request,
 *      res: Response,
 *      next: NextFunction
 *    ): Promise<any> {
 *      (req as any).myData = 'My custom request data!';
 *      return next();
 *    }
 * }
 */

/**
 * Interface for classes that are entities.
 *
 * @class ~InjectedEntity
 * @hideconstructor
 * @abstract
 * @classdesc The InjectedEntity interface. This class can't be instantiated.
 * @memberof module:Injector
 */
/**
 * This function is triggered when the entity is loaded. Function is Async
 *
 * @public
 * @method ~InjectedEntity.onLoad
 * @memberof module:Injector
 *
 * @returns {Promise<void>}
 *
 * @example <caption>Example usage of [InjectedEntity]{@link module:Injector~InjectedEntity}.</caption>
 * [\@Inject]{@link module:Injector.Inject}
 * [\@Entity]{@link module:Router.Entity}('Name')
 * export default class ClassName implements [InjectedEntity]{@link module:Injector~InjectedEntity} {
 *    public async [onLoad]{@link module:Injector~InjectedEntity.onLoad}(): Promise<void> {
 *
 *    }
 * }
 */

/**
 * Interface for classes that are injected.
 *
 * @class ~InjectedClass
 * @hideconstructor
 * @abstract
 * @classdesc The InjectedClass interface. This class can't be instantiated.
 * @memberof module:Injector
 */

/**
 * This function is triggered when Injector.ready() is called. Function is Async
 *
 * @public
 * @method ~InjectedClass.onReady
 * @memberof module:Injector
 *
 * @returns {Promise<void>}
 *
 * @example <caption>Example usage of [InjectedClass]{@link module:Injector~InjectedClass}.</caption>
 * [\@Inject]{@link module:Injector.Inject}
 * export default class ClassName implements [InjectedClass]{@link module:Injector~InjectedClass} {
 *    public async [onReady]{@link module:Injector~InjectedClass.onReady}(): Promise<void> {
 *
 *    }
 * }
 */

/**
 * @static
 * @type {InjectType}
 * @memberof module:Injector
 *
 * @property {number} Class The Class type. Injects the class.
 * @property {number} Function The Function type. Injects the function.
 * @property {number} FunctionResult The FunctionResult type. Injects the function's result.
 * @property {number} Variable The Variable type. Injects the variable.
 * @property {number} Middleware The Middleware type. Injects the middleware as a Class
 */
export enum InjectType {
  Class,
  Function,
  FunctionResult,
  Variable,
  Middleware
}

export interface InstanceObject {
  instance: any;
  type: InjectType;
}

export interface Instances {
  [key: string]: InstanceObject;
}
