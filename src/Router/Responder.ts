import hash from 'object-hash';

import ExpressTS from '../app/ExpressTS';

/**
 * This decorator is used to define a Responder.
 * Responders are **automatically** injected.
 *
 * All the responders must be in ``src/responders`` and they must have [\@Inject]{@link module:Injector.Inject}
 *
 * For an example on how the responder is used, check the [example from \@Post]{@link module:Router.Post}.
 * @static
 * @return {any}
 * @method Responder
 * @memberof module:Router
 * @param {!string} name The name of the responder (This will have as prefix ``Responder.``)
 * @example <caption>Example usage of [\@Responder]{@link module:Router.Responder}.</caption>
 * [\@Inject]{@link module:Injector.Inject}
 * [\@Responder]{@link module:Router.Responder}('Name') // This will be accessed as 'Responder.Name'
 * export default class ResponderName {
 *    public success(res: Response) {
 *      return res.status(200).json({
 *        success: true
 *      });
 *    }
 *
 *    public created(res: Response, userId: string) {
 *      return res.status(201).json({
 *        success: true,
 *        userId
 *      });
 *    }
 * }
 */
export default (name: string): any => (constructor: any) => {
  if (constructor.name === '_injected') {
    throw new Error('The responder must be called first!');
  }

  const responderHash = hash(constructor);
  if (!ExpressTS.getData(responderHash, 'responders')) {
    ExpressTS.setData(responderHash, name, 'responders');
  }

  return constructor;
};
