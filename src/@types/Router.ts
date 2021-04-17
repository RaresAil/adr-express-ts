import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction as ExpressNext
} from 'express';

export enum ActionMethods {
  GET = 'get',
  PUT = 'put',
  POST = 'post',
  HEAD = 'head',
  COPY = 'copy',
  LOCK = 'lock',
  TRACE = 'trace',
  PURGE = 'purge',
  PATCH = 'patch',
  UNLOCK = 'unlock',
  DELETE = 'delete',
  OPTIONS = 'options'
}

export interface FunctionParamData {
  index: number;
  name: string;
  target: string;
}

export interface FunctionParamsLoad {
  [key: string]: FunctionParamData[];
}

export interface ActionFunction {
  name: string;
  method: ActionMethods;
  child?: string;
  params?: any[];
  middlewares?: (string | Function)[];
}

export interface Action {
  target?: Function;
  instance?: any;
  path?: string;
  functions: ActionFunction[];
  middlewares?: (string | Function)[];
}

export interface Actions {
  [name: string]: Action;
}

export interface Responders {
  [key: string]: string;
}

export interface DomainList {
  [key: string]: string;
}

export interface EntityList {
  [key: string]: string;
}

export interface RouteCallback<
  TReq = ExpressRequest,
  TRes = ExpressResponse,
  TNext = ExpressNext
> {
  (req: TReq, res: TRes, next: TNext): Promise<any>;
}
