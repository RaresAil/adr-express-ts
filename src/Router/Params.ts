import { NextFunction, Response, Request } from 'express';

enum Params {
  ExpressRequest = 'express.request',
  ExpressResponse = 'express.response',
  ExpressNext = 'express.next'
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
    default:
      return undefined;
  }
};

export default Params;
