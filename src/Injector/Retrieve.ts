import Injector from './Injector';

/**
 * This decorator is used to Retrieve/get an injected object/variable.
 * The Retrieve decorator only works on the classes that have [\@Inject]{@link module:Injector.Inject}
 * or [\@Action]{@link module:Router.Action}
 * For functions/classes that can't use [\@Retrieve]{@link module:Injector.Retrieve},
 * use [Injector.get()]{@link module:Injector~Injector.get}
 * @static
 * @function Retrieve
 * @memberof module:Injector
 * @return {any}
 * @param {string} name The name of the object/variable.
 * @example <caption>Example usage of [\@Retrieve]{@link module:Injector.Retrieve}.</caption>
 * export default class ClassName {
 *    [\@Retrieve]{@link module:Injector.Retrieve}('name')
 *    private variable?: Type;
 * }
 */
export default (name: string): any => (target: any, key: string | symbol) => {
  const getter = () => {
    return Injector.get<any>(name);
  };

  Object.defineProperty(target, key, {
    get: getter,
    configurable: false,
    enumerable: false
  });
};
