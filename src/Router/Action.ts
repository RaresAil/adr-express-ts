import { Action } from '../@types/Router';
import ExpressTS from '../app/ExpressTS';

/**
 * This decorator is used to define an action.
 * Actions are **automatically** injected.
 *
 * All the actions must be in ``src/actions`` and to have the ``@Action`` decorator.
 *
 * The middlewares can be [Class Middlewares (Injected)]{@link module:Injector~MiddlewareClass}
 * as strings or function middlewares.
 * @static
 * @return {any}
 * @param {!string} path The path of the router
 * @param {?Array.<string | Function>} middlewares Middlewares
 * @example <caption>Example usage of [\@Action]{@link module:Router.@Action}.</caption>
 * [\@Action]{@link module:Router.@Action}('/path', ['ClassMiddleware', functionMiddleware])
 * export default class ActionName {
 *
 * }
 */
export default (path: string, middlewares?: (string | Function)[]): any => (
  constructor: any
) => {
  const Original = constructor;
  const action = ExpressTS.getData(Original.name, 'actions') as Action;

  if (!action) {
    ExpressTS.setData(
      Original.name,
      {
        target: Original,
        instance: new Original(),
        path,
        functions: [],
        middlewares
      },
      'actions'
    );
  } else {
    ExpressTS.setData(
      Original.name,
      {
        ...action,
        target: Original,
        instance: new Original(),
        path,
        middlewares
      },
      'actions'
    );
  }

  const _injectedAction: any = function () {};
  ExpressTS.inject(_injectedAction, Original, 'action');
  return _injectedAction;
};
