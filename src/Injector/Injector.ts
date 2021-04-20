import { InjectType, Instances } from '../@types/Injector';
import { Configuration } from '../Configuration';
import ExpressTS from '../app/ExpressTS';

/**
 * @abstract
 * @class
 * @classdesc The injector class. This class can't be instantiated.
 * @memberof module:Injector
 */
export default abstract class Injector {
  private static instances: Instances = {};

  /**
   * @private
   * @hideconstructor
   */
  private constructor() {}

  /**
   * This function is used to setup the configuration of the server
   *
   * @param {Configuration} config The configuration of the server
   */
  public static setup(config: Configuration) {
    Injector.inject('Configuration', config, InjectType.Variable);
  }

  /**
   * This function is used to get an injected object/variable.
   * If you have a class, you can use the [\@Retrieve]{@link module:Injector.Retrieve}
   * decorator
   * @param {string} name The name of the object/variable.
   * @return {T | null}
   * @example <caption>Example usage of [Injector.get]{@link module:Injector.Injector.get}.</caption>
   * [Injector.get]{@link module:Injector.Injector.get}<string>('name');
   * [Injector.get]{@link module:Injector.Injector.get}<Configuration>('Configuration');
   */
  public static get<T>(name: string): T | null {
    if (!this.instances[name.toString()]?.instance) {
      return null;
    }

    return this.instances[name.toString()].instance;
  }

  /**
   * This function is used to inject an object/variable.
   * @param {string} name The name of the object/variable.
   * @param {any} value The object/variable.
   * @param {module:Injector.InjectType} type The type of the object
   * @return {void}
   */
  public static inject(
    name: string,
    value: any,
    type: InjectType = InjectType.Class
  ): void {
    if (!value) {
      throw new Error('A value is required for injection');
    }

    const injectedName = ExpressTS.getInjectedField(value, 'name');
    const injectedType = ExpressTS.getInjectedField(value, 'type');
    const InstanceTarget = ExpressTS.getData(injectedName, 'injections');

    if (
      InstanceTarget &&
      !this.instances[name.toString()] &&
      (type === InjectType.Class || type === InjectType.Middleware)
    ) {
      if (injectedType !== 'class') {
        throw new Error(
          `The injected type for '${injectedName}' is '${injectedType}', but the InjectType is not 'Class' or 'Middleware'`
        );
      }

      const instance = new InstanceTarget();
      this.instances = {
        ...this.instances,
        [name]: {
          instance,
          type
        }
      };
    } else if (type === InjectType.Variable || type === InjectType.Function) {
      this.instances = {
        ...this.instances,
        [name]: {
          instance: value,
          type
        }
      };
    } else if (type === InjectType.FunctionResult) {
      const func = value();
      this.instances = {
        ...this.instances,
        [name]: {
          instance: func,
          type
        }
      };
    } else {
      throw new Error(`Unable to inject ${name} with type ${type}`);
    }
  }

  /**
   * This function will trigger the onLoad as a promise and
   * after will trigger the onReady
   */
  public static async ready() {
    const entities = Object.values(this.instances).filter(
      (x: any) => x.type === InjectType.Class && x.instance && x.instance.onLoad
    );

    await entities.reduce(
      (current: Promise<void>, next) =>
        current.then<void, void>(() => next.instance.onLoad()),
      Promise.resolve()
    );

    Object.values(this.instances)
      .filter(
        (x: any) =>
          x.type === InjectType.Class && x.instance && x.instance.onReady
      )
      .map((x: any) => x.instance.onReady());

    ExpressTS.clearInjections();
  }
}
