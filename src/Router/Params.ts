import { NextFunction, Response, Request } from 'express';

enum Params {
  ExpressRequest = 'express.request',
  ExpressResponse = 'express.response',
  ExpressNext = 'express.next',
  ExpressRequestBody = 'express.request.body',
  ExpressRequestQuery = 'express.request.query',
  ExpressRequestParams = 'express.request.params'
}

export const getParamValue = (
  name: string,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  switch (name) {
    case Params.ExpressRequest:
      return req;
    case Params.ExpressResponse:
      return res;
    case Params.ExpressNext:
      return next;
    case Params.ExpressRequestBody:
      return req.body;
    case Params.ExpressRequestQuery:
      return req.query;
    case Params.ExpressRequestParams:
      return req.params;
    default:
      return undefined;
  }
};

export default Params;
