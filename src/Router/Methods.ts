import { ActionMethods } from '../@types/Router';
import defineMethod from '../app/defineMethod';

/**
 * This decorator is used to define a GET Route.
 *
 * The middlewares can be [Class Middlewares (Injected)]{@link module:Injector~MiddlewareClass}
 * as strings or function middlewares.
 * @static
 * @return {any}
 * @param {string} [child=/] The path of the route (This will have as prefix the Action's path)
 * @param {?Array.<string | Function>} middlewares Middlewares
 * @example <caption>Example usage of [\@Get]{@link module:Router.@Get}.</caption>
 * [\@Action]{@link module:Router.@Action}('/path', ['ClassMiddleware', functionMiddleware])
 * export default class ActionName {
 *    [\@Retrive]{@link module:Injector.@Retrive}('Responder.Name')
 *    private [responder]{@link module:Router.@Responder}?: [ResponderName]{@link module:Router.@Responder};
 *
 *    [\@Get]{@link module:Router.@Get}('/sub-path', ['SubPathMiddleware']) // The url will be /api/path/sub-path
 *    public findAll(
 *      [\@Request]{@link module:Router.@Request} req: Request,
 *      [\@Response]{@link module:Router.@Response} res: Response
 *    ): Promise<any> {
 *      return this.[responder]{@link module:Router.@Responder}!.[success]{@link module:Router.@Responder}(res);
 *    }
 *
 *    // The url will be /api/path/sub-path/:id (where :id is a path parameter)
 *    [\@Get]{@link module:Router.@Get}('/sub-path/:id', ['SubPathMiddleware'])
 *    public findById(
 *      [\@Request]{@link module:Router.@Request} req: Request,
 *      [\@Response]{@link module:Router.@Response} res: Response
 *    ): Promise<any> {
 *      return this.[responder]{@link module:Router.@Responder}!.[success]{@link module:Router.@Responder}(res);
 *    }
 * }
 */
export const Get = (child?: string, middlewares?: (string | Function)[]): any =>
  defineMethod(ActionMethods.GET, child, middlewares);

/**
 * This decorator is used to define a POST Route.
 *
 * The middlewares can be [Class Middlewares (Injected)]{@link module:Injector~MiddlewareClass}
 * as strings or function middlewares.
 * @static
 * @return {any}
 * @param {string} [child=/] The path of the route (This will have as prefix the Action's path)
 * @param {?Array.<string | Function>} middlewares Middlewares
 * @example <caption>Example usage of [\@Post]{@link module:Router.@Post}.</caption>
 * [\@Action]{@link module:Router.@Action}('/path', ['ClassMiddleware', functionMiddleware])
 * export default class ActionName {
 *    [\@Retrive]{@link module:Injector.@Retrive}('Responder.Name')
 *    private [responder]{@link module:Router.@Responder}?: [ResponderName]{@link module:Router.@Responder};
 *
 *    [\@Retrive]{@link module:Injector.@Retrive}('Domain.Name')
 *    private [domain]{@link module:Router.@Domain}?: [DomainName]{@link module:Router.@Domain};
 *
 *    [\@Post]{@link module:Router.@Post}('/sub-path', ['SubPathMiddleware']) // The url will be /api/path/sub-path
 *    public saveItem(
 *      [\@Request]{@link module:Router.@Request} req: Request,
 *      [\@Response]{@link module:Router.@Response} res: Response
 *    ): Promise<any> {
 *      const { userId } = (
 *        await this.[domain]{@link module:Router.@Domain}!.[saveUser]{@link module:Router.@Domain}('Some Name')
 *      );
 *      return this.[responder]{@link module:Router.@Responder}!.[created]{@link module:Router.@Responder}(res, userId);
 *    }
 * }
 */
export const Post = (
  child?: string,
  middlewares?: (string | Function)[]
): any => defineMethod(ActionMethods.POST, child, middlewares);

/**
 * This decorator is used to define a PUT Route.
 *
 * The middlewares can be [Class Middlewares (Injected)]{@link module:Injector~MiddlewareClass}
 * as strings or function middlewares.
 * @static
 * @return {any}
 * @param {string} [child=/] The path of the route (This will have as prefix the Action's path)
 * @param {?Array.<string | Function>} middlewares Middlewares
 * @example <caption>Example usage of [\@Put]{@link module:Router.@Put}.</caption>
 * [\@Action]{@link module:Router.@Action}('/path', ['ClassMiddleware', functionMiddleware])
 * export default class ActionName {
 *    [\@Retrive]{@link module:Injector.@Retrive}('Responder.Name')
 *    private [responder]{@link module:Router.@Responder}?: [ResponderName]{@link module:Router.@Responder};
 *
 *    // The url will be /api/path/sub-path/:id (where :id is a path parameter)
 *    [\@Put]{@link module:Router.@Put}('/sub-path/:id', ['SubPathMiddleware'])
 *    public replaceItem(
 *      [\@Request]{@link module:Router.@Request} req: Request,
 *      [\@Response]{@link module:Router.@Response} res: Response
 *    ): Promise<any> {
 *      return this.[responder]{@link module:Router.@Responder}!.[success]{@link module:Router.@Responder}(res);
 *    }
 * }
 */
export const Put = (child?: string, middlewares?: (string | Function)[]): any =>
  defineMethod(ActionMethods.PUT, child, middlewares);

/**
 * This decorator is used to define a PATCH Route.
 *
 * The middlewares can be [Class Middlewares (Injected)]{@link module:Injector~MiddlewareClass}
 * as strings or function middlewares.
 * @static
 * @return {any}
 * @param {string} [child=/] The path of the route (This will have as prefix the Action's path)
 * @param {?Array.<string | Function>} middlewares Middlewares
 * @example <caption>Example usage of [\@Patch]{@link module:Router.@Patch}.</caption>
 * [\@Action]{@link module:Router.@Action}('/path', ['ClassMiddleware', functionMiddleware])
 * export default class ActionName {
 *    [\@Retrive]{@link module:Injector.@Retrive}('Responder.Name')
 *    private [responder]{@link module:Router.@Responder}?: [ResponderName]{@link module:Router.@Responder};
 *
 *    // The url will be /api/path/sub-path/:id (where :id is a path parameter)
 *    [\@Patch]{@link module:Router.@Patch}('/sub-path/:id', ['SubPathMiddleware'])
 *    public updateItem(
 *      [\@Request]{@link module:Router.@Request} req: Request,
 *      [\@Response]{@link module:Router.@Response} res: Response
 *    ): Promise<any> {
 *      return this.[responder]{@link module:Router.@Responder}!.[success]{@link module:Router.@Responder}(res);
 *    }
 * }
 */
export const Patch = (
  child?: string,
  middlewares?: (string | Function)[]
): any => defineMethod(ActionMethods.PATCH, child, middlewares);

/**
 * This decorator is used to define a DELETE Route.
 *
 * The middlewares can be [Class Middlewares (Injected)]{@link module:Injector~MiddlewareClass}
 * as strings or function middlewares.
 * @static
 * @return {any}
 * @param {string} [child=/] The path of the route (This will have as prefix the Action's path)
 * @param {?Array.<string | Function>} middlewares Middlewares
 * @example <caption>Example usage of [\@Delete]{@link module:Router.@Delete}.</caption>
 * [\@Action]{@link module:Router.@Action}('/path', ['ClassMiddleware', functionMiddleware])
 * export default class ActionName {
 *    [\@Retrive]{@link module:Injector.@Retrive}('Responder.Name')
 *    private [responder]{@link module:Router.@Responder}?: [ResponderName]{@link module:Router.@Responder};
 *
 *    // The url will be /api/path/sub-path/:id (where :id is a path parameter)
 *    [\@Delete]{@link module:Router.@Delete}('/sub-path/:id', ['SubPathMiddleware'])
 *    public deleteItem(
 *      [\@Request]{@link module:Router.@Request} req: Request,
 *      [\@Response]{@link module:Router.@Response} res: Response
 *    ): Promise<any> {
 *      return this.[responder]{@link module:Router.@Responder}!.[success]{@link module:Router.@Responder}(res);
 *    }
 * }
 */
export const Delete = (
  child?: string,
  middlewares?: (string | Function)[]
): any => defineMethod(ActionMethods.DELETE, child, middlewares);
