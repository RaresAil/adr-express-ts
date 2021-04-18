import hash from 'object-hash';

import { Action } from '../@types/Router';
import ExpressTS from '../app/ExpressTS';

/**
 * This decorator is used to define an action.
 * Actions are **automatically** injected.
 *
 * All the actions must be in ``src/actions`` and to have the ``@Action`` decorator.
 *
 * The middlewares can be [Class Middlewares (Injected)]{@link module:Injector~Middleware}
 * as strings or function middlewares.
 * @static
 * @return {any}
 * @method Action
 * @memberof module:Router
 * @param {!string} path The path of the router
 * @param {?Array.<string | Function>} middlewares Middlewares
 * @example <caption>Example usage of [\@Action]{@link module:Router.Action}.</caption>
 * [\@Action]{@link module:Router.Action}('/path', ['ClassMiddleware', functionMiddleware])
 * export default class ActionName {
 *
 * }
 */
export default (path: string, middlewares?: (string | Function)[]): any => (
  constructor: any
) => {
  const actionHash = hash(constructor);
  const action = ExpressTS.getData(actionHash, 'actions') as Action;

  if (!action) {
    ExpressTS.setData(
      actionHash,
      {
        target: constructor,
        instance: new constructor(),
        path,
        functions: [],
        middlewares
      },
      'actions'
    );
  } else {
    ExpressTS.setData(
      actionHash,
      {
        ...action,
        target: constructor,
        instance: new constructor(),
        path,
        middlewares
      },
      'actions'
    );
  }

  const _injectedAction: any = function () {};
  ExpressTS.inject(_injectedAction, constructor, 'action', actionHash);
  return _injectedAction;
};
