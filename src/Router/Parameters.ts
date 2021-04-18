import defineParameter from '../app/defineParameter';
import { default as ParamsEnum } from './Params';

/**
 * This decorator is used to get the Express's Request when using an [\@Action]{@link module:Router.Action}.
 *
 * For an example usage of [\@Request]{@link module:Router.@Request}. Check [\@Get]{@link module:Router.Get}
 *
 * @static
 * @member {Express.Request} @Request
 * @memberof module:Router
 */
export const Request = defineParameter(ParamsEnum.ExpressRequest);

/**
 * This decorator is used to get the Express's Response when using an [\@Action]{@link module:Router.Action}.
 *
 * For an example usage of [\@Response]{@link module:Router.@Response}. Check [\@Get]{@link module:Router.Get}
 *
 * @static
 * @member {Express.Response} @Response
 * @memberof module:Router
 */
export const Response = defineParameter(ParamsEnum.ExpressResponse);

/**
 * This decorator is used to get the Express's Response when using an [\@Action]{@link module:Router.Action}.
 *
 * For an example usage of [\@Next]{@link module:Router.@Next}. Check [\@Get]{@link module:Router.Get}
 *
 * @static
 * @member {Express.NextFunction} @Next
 * @memberof module:Router
 */
export const Next = defineParameter(ParamsEnum.ExpressNext);

/**
 * This decorator is used to post the Express's Request Body when using an [\@Action]{@link module:Router.Action}.
 *
 * For an example usage of [\@Body]{@link module:Router.@Body}. Check [\@Post]{@link module:Router.Post}
 *
 * @static
 * @member {Express.Request.Body} @Body
 * @memberof module:Router
 */
export const Body = defineParameter(ParamsEnum.ExpressRequestBody);

/**
 * This decorator is used to get the Express's Request Query when using an [\@Action]{@link module:Router.Action}.
 *
 * For an example usage of [\@Query]{@link module:Router.@Query}. Check [\@Get]{@link module:Router.Get}
 *
 * @static
 * @member {Express.Request.Query} @Query
 * @memberof module:Router
 */
export const Query = defineParameter(ParamsEnum.ExpressRequestQuery);

/**
 * This decorator is used to get the Express's Request Params when using an [\@Action]{@link module:Router.Action}.
 *
 * For an example usage of [\@Params]{@link module:Router.@Params}. Check [\@Get]{@link module:Router.Get}
 *
 * @static
 * @member {Express.Request.Params} @Params
 * @memberof module:Router
 */
export const Params = defineParameter(ParamsEnum.ExpressRequestParams);
