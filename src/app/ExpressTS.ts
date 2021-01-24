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

  private static validateType(type: DataType): string {
    switch (type) {
      case 'functionParams':
        return type;
      case 'injections':
        return type;
      case 'responders':
        return type;
      case 'entities':
        return type;
      case 'domains':
        return type;
      case 'actions':
        return type;
      default:
        throw new Error('Invalid Data Type!');
    }
  }

  static inject(target: any, source: Function, type: InjectType) {
    target.prototype = source.prototype;
    target[this.symbols.name] = source.name;
    target[this.symbols.type] = type;
  }

  static getInjectedField(target: any, field: 'name' | 'type') {
    return target[this.symbols[field.toString()]];
  }

  static clearInjections() {
    this.injections = {};
  }

  static setData(name: string, value: any, type: DataType) {
    if (!name || !type) {
      return null;
    }

    const validType = this.validateType(type);
    (this as any)[validType.toString()] = {
      ...(this as any)[validType.toString()],
      [name]: value
    };
  }

  static getData(name: string | undefined, type: DataType) {
    if (!name || !type) {
      return null;
    }

    const validType = this.validateType(type);
    if (!(this as any)[validType.toString()][name.toString()]) {
      return null;
    }

    if (Array.isArray((this as any)[validType.toString()][name.toString()])) {
      return [...(this as any)[validType.toString()][name.toString()]];
    }

    switch (typeof (this as any)[validType.toString()][name.toString()]) {
      case 'string':
        return `${(this as any)[validType.toString()][name.toString()]}`;
      case 'object':
        return Object.assign(
          {},
          (this as any)[validType.toString()][name.toString()]
        );
      default:
        return (this as any)[validType.toString()][name.toString()];
    }
  }
}
