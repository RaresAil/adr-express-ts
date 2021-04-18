import hash from 'object-hash';

import { FunctionParamData } from '../@types/Router';
import ExpressTS from './ExpressTS';

export default (payload: any) => (
  target: any,
  propertyKey: string | symbol,
  parameterIndex: number
) => {
  const actionHash = hash(target.constructor);

  let params: FunctionParamData[] =
    (ExpressTS.getData(actionHash, 'functionParams') as FunctionParamData[]) ??
    [];

  params = [
    ...params,
    {
      index: parameterIndex,
      name: propertyKey,
      target: payload
    } as FunctionParamData
  ];

  ExpressTS.setData(actionHash, params, 'functionParams');
};
