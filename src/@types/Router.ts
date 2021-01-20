/* eslint-disable no-unused-vars */
export enum ActionMethods {
  GET = 'get',
  PUT = 'put',
  POST = 'post',
  PATCH = 'patch',
  DELETE = 'delete'
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
