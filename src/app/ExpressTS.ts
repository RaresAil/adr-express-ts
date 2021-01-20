/* eslint-disable require-jsdoc */

import {
  FunctionParamsLoad,
  FunctionParamData,
  Responders,
  Actions,
  Action
} from '../@types/Router';

type InjectType = 'class' | 'action';

export default abstract class ExpressTS {
  private static injections: { [key: string]: Function } = {};
  private static functionsParams: FunctionParamsLoad = {};
  private static symbols: { [key: string]: any } = {
    name: Symbol('injectedName'),
    type: Symbol('type')
  };
  private static responders: Responders = {};
  private static actions: Actions = {};

  // #region Injector
  static setInjection(name: string, value: Function) {
    this.injections = {
      ...this.injections,
      [name]: value
    };
  }

  static getInjection(name: string) {
    if (!this.injections[name]) {
      return null;
    }

    return Object.assign({}, this.injections[name]) as any;
  }

  static inject(target: any, source: Function, type: InjectType) {
    target.prototype = source.prototype;
    target[this.symbols.name] = source.name;
    target[this.symbols.type] = type;
  }

  static getInjectedField(target: any, field: 'name' | 'type') {
    return target[this.symbols[field]];
  }

  static clearInjections() {
    this.injections = {};
  }
  // #endregion

  // #region Actions
  static setAction(name: string, action: Action) {
    this.actions = {
      ...this.actions,
      [name]: action
    };
  }

  static getAction(name: string): Action | null {
    if (!this.actions[name]) {
      return null;
    }

    return Object.assign({}, this.actions[name]);
  }

  static setFunctionsParams(name: string, param: FunctionParamData[]) {
    this.functionsParams = {
      ...this.functionsParams,
      [name]: param
    };
  }

  static getFunctionsParams(name: string) {
    if (!this.functionsParams[name]) {
      return null;
    }

    return [...this.functionsParams[name]];
  }
  // #endregion

  static setResponder(name: string, responder: string) {
    this.responders = {
      ...this.responders,
      [name]: responder
    };
  }

  static getResponder(name: string): string | null {
    if (!this.responders[name]) {
      return null;
    }

    return `${this.responders[name]}`;
  }
}
