import { ActionFunction, ActionMethods } from '../@types/Router';
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

  const action = ExpressTS.getAction(name);

  if (!action) {
    ExpressTS.setAction(name, {
      functions: [actionFunction]
    });
  } else {
    ExpressTS.setAction(name, {
      ...action,
      functions: [...action.functions, actionFunction]
    });
  }

  return descriptor;
};
