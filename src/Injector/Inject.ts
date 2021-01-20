import ExpressTS from '../app/ExpressTS';

/**
 * This decorator is used to inject a class.
 * @static
 * @param {Function} constructor
 * @return {any}
 * @example <caption>Example usage of [\@Inject]{@link module:Injector.@Inject}.</caption>
 * // [InjectedClass]{@link module:Injector~InjectedClass} is optional, only if you want to use the onReady function.
 * [\@Inject]{@link module:Injector.@Inject}
 * export default class ClassName implements [InjectedClass]{@link module:Injector~InjectedClass} {
 *    // Mandatory if you have [InjectedClass]{@link module:Injector~InjectedClass}.
 *    public async [onReady()]{@link module:Injector~InjectedClass.onReady}: Promise<void> {
 *
 *    }
 * }
 */
export default function Inject(constructor: Function): any {
  const Original = constructor;
  if (!ExpressTS.getData(Original.name, 'injections')) {
    ExpressTS.setData(Original.name, Original, 'injections');
  }

  const _injected: any = function () {};

  ExpressTS.inject(_injected, Original, 'class');
  return _injected;
}
