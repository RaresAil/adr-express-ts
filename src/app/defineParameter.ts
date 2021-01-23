import { FunctionParamData } from '../@types/Router';
import ExpressTS from './ExpressTS';

export default (payload: any) => (
  target: any,
  propertyKey: string | symbol,
  parameterIndex: number
) => {
  const { name } = target.constructor;
  let params: FunctionParamData[] =
    (ExpressTS.getData(name, 'functionParams') as FunctionParamData[]) ?? [];

  params = [
    ...params,
    {
      index: parameterIndex,
      name: propertyKey,
      target: payload
    } as FunctionParamData
  ];

  ExpressTS.setData(name, params, 'functionParams');
};
