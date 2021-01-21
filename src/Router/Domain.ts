import ExpressTS from '../app/ExpressTS';

/**
 * This decorator is used to define a Domain.
 * Domain classes are **automatically** injected.
 *
 * All the Domain classes must be in ``src/domain`` and they must have [\@Inject]{@link module:Injector.Inject}
 *
 * For an example on how the domain is used, check the [example from \@Post]{@link module:Router.Post}.
 *
 * @static
 * @return {any}
 * @method Domain
 * @memberof module:Router
 * @param {!string} name The name of the domain (This will have as prefix ``Domain.``)
 * @example <caption>Example usage of [\@Domain]{@link module:Router.Domain}.</caption>
 * [\@Inject]{@link module:Injector.Inject}
 * [\@Domain]{@link module:Router.Domain}('Name') // This will be accessed as 'Domain.Name'
 * export default class DomainName {
 *    public async saveUser(name: string) {
 *      ...
 *      return {
 *        userId: '123'
 *      };
 *    }
 * }
 */
export default (name: string): any => (constructor: any) => {
  if (constructor.name === '_injected') {
    throw new Error('The domain must be called first!');
  }

  if (!ExpressTS.getData(constructor.name, 'domains')) {
    ExpressTS.setData(constructor.name, name, 'domains');
  }

  return constructor;
};
