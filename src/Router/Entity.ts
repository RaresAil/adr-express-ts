import hash from 'object-hash';

import ExpressTS from '../app/ExpressTS';

/**
 * This decorator is used to define an Entity.
 * Entities are **automatically** injected.
 *
 * All the Entities must be in ``src/domain/entities`` and they must have [\@Inject]{@link module:Injector.Inject}
 *
 * @static
 * @return {any}
 * @method Entity
 * @memberof module:Router
 * @param {!string} name The name of the entity (This will have as prefix ``Entity.``)
 * @example <caption>Example usage of [\@Entity]{@link module:Router.Entity}.</caption>
 * // This will be accessed as 'Entity.Name' but most of the ORMs such as Mongoose
 * // keeps an instance of the model, e.g. mongoose.models
 * [\@Inject]{@link module:Injector.Inject}
 * [\@Entity]{@link module:Router.Entity}('Name')
 * export default class UserEntity implements [InjectedEntity]{@link module:Injector~InjectedEntity} {
 *    [\@Retrive]{@link module:Injector.Retrive}('Mongoose')
 *    private mongoose?: MongooseClass;
 *
 *    public async [onLoad]{@link module:Injector~InjectedEntity.onLoad}(): Promise<void> {
 *      if (!this.mongoose) {
 *        return;
 *      }
 *
 *      const { ObjectId } = Schema as any;
 *
 *      this.mongoose.model(
 *        'User',
 *        new Schema({
 *          id: ObjectId,
 *          email: {
 *            type: String,
 *            min: 3,
 *            max: 255,
 *            required: true
 *          },
 *          password: {
 *            type: String,
 *            min: 8,
 *            required: true
 *          }
 *        })
 *      );
 *    }
 * }
 */
export default (name: string): any => (constructor: any) => {
  if (constructor.name === '_injected') {
    throw new Error('The entity must be called first!');
  }

  const entityHash = hash(constructor);
  if (!ExpressTS.getData(entityHash, 'entities')) {
    ExpressTS.setData(entityHash, name, 'entities');
  }

  return constructor;
};
