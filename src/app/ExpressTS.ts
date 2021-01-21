/* eslint-disable require-jsdoc */

import {
  FunctionParamsLoad,
  Responders,
  DomainList,
  Actions,
  EntityList
} from '../@types/Router';

type InjectType = 'class' | 'action';
type DataType =
  | 'functionParams'
  | 'injections'
  | 'responders'
  | 'entities'
  | 'domains'
  | 'actions';

export default abstract class ExpressTS {
  private static injections: { [key: string]: Function } = {};
  private static functionParams: FunctionParamsLoad = {};
  private static symbols: { [key: string]: any } = {
    name: Symbol('injectedName'),
    type: Symbol('type')
  };
  private static responders: Responders = {};
  private static entities: EntityList = {};
  private static domains: DomainList = {};
  private static actions: Actions = {};

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

  static setData(name: string, value: any, type: DataType) {
    this[type] = {
      ...this[type],
      [name]: value
    };
  }

  static getData(name: string, type: DataType) {
    if (!this[type][name]) {
      return null;
    }

    if (Array.isArray(this[type][name])) {
      return [...(this[type][name] as any)];
    }

    switch (typeof this[type][name]) {
      case 'string':
        return `${this[type][name]}`;
      case 'object':
        return Object.assign({}, this[type][name]);
      default:
        return this[type][name];
    }
  }
}
