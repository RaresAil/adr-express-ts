import hash from 'object-hash';

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
  const actionHash = hash((target as any).constructor);

  const actionFunction: ActionFunction = {
    name: key as string,
    method,
    child,
    middlewares
  };

  const action = ExpressTS.getData(actionHash, 'actions') as Action;

  if (!action) {
    ExpressTS.setData(
      actionHash,
      {
        functions: [actionFunction]
      },
      'actions'
    );
  } else {
    ExpressTS.setData(
      actionHash,
      {
        ...action,
        functions: [...action.functions, actionFunction]
      },
      'actions'
    );
  }

  return descriptor;
};
