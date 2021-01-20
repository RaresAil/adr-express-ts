import Injector from './Injector';

/**
 * This decorator is used to retrive/get an injected object/variable.
 * The Retrive decorator only works on the classes that have [\@Inject]{@link module:Injector.@Inject}
 * or [\@Action]{@link module:Router.@Action}
 * For fuctions/classes that can't use [\@Retrive]{@link module:Injector.@Retrive},
 * use [Injector.get()]{@link module:Injector~Injector.get}
 * @static
 * @return {any}
 * @param {string} name The name of the object/variable.
 * @example <caption>Example usage of [\@Retrive]{@link module:Injector.@Retrive}.</caption>
 * export default class ClassName {
 *    [\@Retrive]{@link module:Injector.@Retrive}('name')
 *    private variable?: Type;
 * }
 */
const Retrive = (name: string): any => (target: any, key: string | symbol) => {
  const getter = () => {
    return Injector.get<any>(name);
  };

  Object.defineProperty(target, key, {
    get: getter,
    configurable: false,
    enumerable: false
  });
};

export default Retrive;
