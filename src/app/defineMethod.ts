import { Action, ActionFunction, ActionMethods } from '../@types/Router';
import ExpressTS from './ExpressTS';

export default (
  method: ActionMethods,
  child?: string,
  middlewares?: (string | Function)[]
) => <T extends {}, K extends keyof T>(
  target: T,
  key: K,
  descriptor: PropertyDescriptor
) => {
  const { name } = (target as any).constructor;
  const actionFunction: ActionFunction = {
    name: key as string,
    method,
    child,
    middlewares
  };

  const action = ExpressTS.getData(name, 'actions') as Action;

  if (!action) {
    ExpressTS.setData(
      name,
      {
        functions: [actionFunction]
      },
      'actions'
    );
  } else {
    ExpressTS.setData(
      name,
      {
        ...action,
        functions: [...action.functions, actionFunction]
      },
      'actions'
    );
  }

  return descriptor;
};
