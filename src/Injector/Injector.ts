import { InjectType, Instances } from '../@types/Injector';
import ExpressTS from '../app/ExpressTS';

/**
 * @abstract
 * @classdesc The injector class. This class can't be instantiated.
 */
export default abstract class Injector {
  private static instances: Instances = {};

  /**
   * @private
   * @hideconstructor
   */
  private constructor() {}

  /**
   * This function is used to get an injected object/variable.
   * If you have a class, you can use the [\@Retrive]{@link module:Injector.@Retrive}
   * decorator
   * @param {string} name The name of the object/variable.
   * @return {T | null}
   */
  public static get<T>(name: string): T | null {
    const entry = ExpressTS.get(name);
    if (!entry?.instance) {
      return null;
    }

    return entry.instance;
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
      throw new Error('A value is requierd for injection');
    }

    const injectedName = ExpressTS.getInjectedField(value, 'name');
    const injectedType = ExpressTS.getInjectedField(value, 'type');
    const InstanceTarget = ExpressTS.get(injectedName);

    if (
      InstanceTarget &&
      !this.instances[name] &&
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

  public static async ready() {
    const entities = Object.values(this.instances).filter(
      (x: any) => x.type === InjectType.Class && x.instance && x.instance.onLoad
    );
    let promises: Promise<void>[] = [];
    entities.forEach((x: any) => {
      promises = [...promises, x.instance.onLoad()];
    });

    await Promise.all(promises);

    const classes = Object.values(this.instances).filter(
      (x: any) =>
        x.type === InjectType.Class && x.instance && x.instance.onReady
    );
    classes.forEach((x: any) => {
      x.instance.onReady();
    });

    ExpressTS.frezee();
  }
}