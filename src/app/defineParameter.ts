import { FunctionParamData } from '../@types/Router';
import ExpressTS from './ExpressTS';

export default (payload: any) => (
  target: any,
  propertyKey: string | symbol,
  parameterIndex: number
) => {
  const { name } = target.constructor;
  let params: FunctionParamData[] = ExpressTS.getFunctionsParams(name) || [];

  params = [
    ...params,
    {
      index: parameterIndex,
      name: propertyKey,
      target: payload
    } as FunctionParamData
  ];

  ExpressTS.setFunctionsParams(name, params);
};
