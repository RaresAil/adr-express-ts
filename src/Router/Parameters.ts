import defineParameter from '../app/defineParameter';
import Params from './Params';

/**
 * This decorator is used to get the Express's Request when using an [\@Action]{@link module:Router.Action}.
 *
 * For an example usage of [\@Request]{@link module:Router.@Request}. Check [\@Get]{@link module:Router.Get}
 *
 * @static
 * @member {Express.Request} @Request
 * @memberof module:Router
 */
export const Request = defineParameter(Params.ExpressRequest);

/**
 * This decorator is used to get the Express's Response when using an [\@Action]{@link module:Router.Action}.
 *
 * For an example usage of [\@Response]{@link module:Router.@Response}. Check [\@Get]{@link module:Router.Get}
 *
 * @static
 * @member {Express.Response} @Response
 * @memberof module:Router
 */
export const Response = defineParameter(Params.ExpressResponse);

/**
 * This decorator is used to get the Express's Response when using an [\@Action]{@link module:Router.Action}.
 *
 * For an example usage of [\@Next]{@link module:Router.@Next}. Check [\@Get]{@link module:Router.Get}
 *
 * @static
 * @member {Express.NextFunction} @Next
 * @memberof module:Router
 */
export const Next = defineParameter(Params.ExpressNext);
