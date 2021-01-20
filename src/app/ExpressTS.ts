/* eslint-disable require-jsdoc */

export type InjectType = 'class';

export default abstract class ExpressTS {
  private static symbols: { [key: string]: any } = {
    name: Symbol('injectedName'),
    type: Symbol('type')
  };
  private static injections: { [key: string]: Function } = {};

  static set(name: string, value: Function) {
    this.injections = {
      ...this.injections,
      [name]: value
    };
  }

  static get(name: string) {
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

  static clear() {
    this.injections = {};
  }
}
