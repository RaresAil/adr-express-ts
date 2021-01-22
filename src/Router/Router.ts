/* eslint-disable require-jsdoc */
import AsyncLock from 'async-lock';
import path from 'path';
import fs from 'fs';
import express, {
  Application,
  Router as ExpressRouter,
  Response as ExpressResponse,
  Request as ExpressRequest,
  NextFunction,
  RequestHandler
} from 'express';

import { Inject, Retrive, Injector } from '../Injector';
import { Action, Middleware } from '../@types';
import { AsyncMiddleware, AsyncRoute } from '../utils';
import ExpressTS from '../app/ExpressTS';
import { getParamValue } from './Params';
import {
  defaultNotFoundHandler,
  defaultErrorHandler,
  NotFoundHandler,
  Configuration,
  ErroHandler,
  StaticFiles
} from '../Configuration';

@Inject
export default class Router {
  @Retrive('Express')
  private application?: Application;

  @Retrive('Configuration')
  private config?: Configuration;

  @Retrive('Middlewares')
  private middlewares?: (string | Function)[];

  private readonly lock: AsyncLock;
  private readonly errorHandler: ErroHandler;
  private readonly notFoundHandler: NotFoundHandler;

  private debugLog(...args: any[]) {
    const empty = () => {};
    (this.config?.debug.log ?? empty)(...args);
  }

  private debugError(...args: any[]) {
    const empty = () => {};
    (this.config?.debug.error ?? empty)(...args);
  }

  private getAbsolutePath(...args: string[]): string {
    return path.join.apply(null, [this.config!.root, ...args]);
  }

  constructor() {
    this.lock = new AsyncLock();

    if (!this.config || !this.config.root) {
      throw new Error('The configuration is not Injected!');
    }

    if (!this.application) {
      throw new Error('The express application is not Injected!');
    }

    this.errorHandler = this.config.errorHandler ?? defaultErrorHandler;
    this.notFoundHandler =
      this.config.notFoundHandler ?? defaultNotFoundHandler;

    this.injectMiddlewares();
    this.injectResponders();
    this.injectEntities();
    this.injectDomains();
    this.injectActions();
  }

  private injectMiddlewares() {
    if (this.middlewares) {
      this.middlewares.forEach((middleware) => {
        if (!this.lock) {
          throw new Error('The async-lock instance is not created!');
        }

        this.lock.acquire('app-middleware-injector', (done) => {
          try {
            if (typeof middleware === 'string') {
              const mid = Injector.get<Middleware | undefined | null>(
                middleware
              );

              if (mid) {
                this.debugLog('Global Middleware loaded %o', middleware);
                this.application?.use(
                  AsyncMiddleware(
                    async (
                      req: ExpressRequest,
                      res: ExpressResponse,
                      next: NextFunction
                    ) => {
                      return await mid.middleware(req, res, next);
                    },
                    this.errorHandler
                  )
                );
              }
            } else if (typeof middleware === 'function') {
              this.debugLog('Global Middleware loaded %o', middleware.name);
              this.application?.use(
                AsyncMiddleware(
                  async (
                    req: ExpressRequest,
                    res: ExpressResponse,
                    next: NextFunction
                  ) => {
                    return await middleware(req, res, next);
                  },
                  this.errorHandler
                )
              );
            }
          } catch {}
          done();
        });
      });
    }
  }

  private injectEntities() {
    fs.readdirSync(this.getAbsolutePath('domain', 'entities')).forEach(
      (name: string) => {
        try {
          let ent;
          try {
            ent = require(this.getAbsolutePath('domain', 'entities', name));
          } catch {
            return;
          }

          if (!ent?.default || !this.lock) {
            return;
          }

          const target = ent.default;
          if (
            ExpressTS.getInjectedField(target, 'type') !== 'class' ||
            !ExpressTS.getInjectedField(target, 'name')
          ) {
            return;
          }

          const entityName = ExpressTS.getData(
            ExpressTS.getInjectedField(target, 'name'),
            'entities'
          );

          if (!entityName) {
            return;
          }

          this.debugLog('Entity loaded %o', entityName);
          Injector.inject(`Entity.${entityName}`, target);
        } catch (e) {
          this.debugError(e);
        }
      }
    );
  }

  private injectDomains() {
    fs.readdirSync(this.getAbsolutePath('domain')).forEach((name: string) => {
      try {
        let dom;

        try {
          dom = require(this.getAbsolutePath('domain', name));
        } catch {
          return;
        }

        if (!dom?.default || !this.lock) {
          return;
        }

        const target = dom.default;
        if (
          ExpressTS.getInjectedField(target, 'type') !== 'class' ||
          !ExpressTS.getInjectedField(target, 'name')
        ) {
          return;
        }

        const domainName = ExpressTS.getData(
          ExpressTS.getInjectedField(target, 'name'),
          'domains'
        );

        if (!domainName) {
          return;
        }

        this.debugLog('Domain loaded %o', domainName);
        Injector.inject(`Domain.${domainName}`, target);
      } catch (e) {
        this.debugError(e);
      }
    });
  }

  private injectResponders() {
    fs.readdirSync(this.getAbsolutePath('responders')).forEach(
      (name: string) => {
        try {
          let resp;

          try {
            resp = require(this.getAbsolutePath('responders', name));
          } catch {
            return;
          }

          if (!resp?.default || !this.lock) {
            return;
          }

          const target = resp.default;
          if (
            ExpressTS.getInjectedField(target, 'type') !== 'class' ||
            !ExpressTS.getInjectedField(target, 'name')
          ) {
            return;
          }

          const responderName = ExpressTS.getData(
            ExpressTS.getInjectedField(target, 'name'),
            'responders'
          );

          this.debugLog('Responder loaded %o', responderName);
          Injector.inject(`Responder.${responderName}`, target);
        } catch (e) {
          this.debugError(e);
        }
      }
    );
  }

  private injectActions() {
    fs.readdirSync(this.getAbsolutePath('actions')).forEach((name: string) => {
      try {
        const ac = require(this.getAbsolutePath('actions', name));
        if (!ac || !ac.default || !this.lock) {
          return;
        }

        const target = ac.default;
        const targetName = ExpressTS.getInjectedField(target, 'name');
        if (
          ExpressTS.getInjectedField(target, 'type') !== 'action' ||
          !targetName
        ) {
          return;
        }

        const action = ExpressTS.getData(targetName, 'actions') as Action;
        const funcParams =
          (ExpressTS.getData(targetName, 'functionParams') as any[]) || [];
        if (!action?.target || action?.functions?.length <= 0) {
          return;
        }

        if (!this.application || !this.config) {
          return;
        }

        const prefix = this.config.apiPrefix ?? '';
        let apiPath = [prefix, action.path ?? ''].join('');

        if (!apiPath || apiPath.trim() === '' || !action?.path) {
          return;
        }

        apiPath = apiPath.startsWith('/')
          ? apiPath.trim()
          : `/${apiPath.trim()}`;
        const router = ExpressRouter();

        if (action.middlewares && Array.isArray(action.middlewares)) {
          action.middlewares.forEach((middleware) => {
            if (!this.lock) {
              return;
            }

            this.lock.acquire('app-middleware-injector', (done) => {
              try {
                if (typeof middleware === 'string') {
                  const mid = Injector.get<Middleware | undefined | null>(
                    middleware
                  );

                  if (mid) {
                    this.debugLog('Action Middleware loaded %o', middleware);
                    router.use(
                      AsyncMiddleware(
                        async (
                          req: ExpressRequest,
                          res: ExpressResponse,
                          next: NextFunction
                        ) => {
                          return await mid.middleware(req, res, next);
                        },
                        this.errorHandler
                      )
                    );
                  }
                } else if (typeof middleware === 'function') {
                  this.debugLog('Action Middleware loaded %o', middleware.name);
                  router.use(
                    AsyncMiddleware(
                      async (
                        req: ExpressRequest,
                        res: ExpressResponse,
                        next: NextFunction
                      ) => {
                        return await middleware(req, res, next);
                      },
                      this.errorHandler
                    )
                  );
                }
              } catch {}

              done();
            });
          });
        }

        action.functions.forEach((functionData) => {
          if (
            !router[functionData.method] ||
            typeof router[functionData.method] !== 'function'
          ) {
            return;
          }

          let child: string = functionData.child ?? '';
          child = child.startsWith('/') ? child : `/${child}`;

          const paramsInfoRaw = funcParams
            .filter(
              (x) => !!x && !!functionData && x.name === functionData.name
            )
            .sort((a, b) => a.index - b.index);

          const paramsInfo: string[] = [];
          paramsInfoRaw.forEach((x) => {
            paramsInfo[x.index] = x.target;
          });

          this.debugLog(
            'Action loaded %o %s %o',
            functionData.method.toUpperCase(),
            child,
            functionData.name
          );

          let middlewares: RequestHandler<any, any, any>[] = [];

          if (
            functionData.middlewares &&
            Array.isArray(functionData.middlewares)
          ) {
            middlewares = functionData.middlewares
              .map((middleware): RequestHandler<any, any, any> | undefined => {
                let ret;

                try {
                  if (typeof middleware === 'string') {
                    const mid = Injector.get<Middleware | undefined | null>(
                      middleware
                    );

                    if (mid) {
                      this.debugLog('Method Middleware loaded %o', middleware);
                      ret = AsyncMiddleware(
                        async (
                          req: ExpressRequest,
                          res: ExpressResponse,
                          next: NextFunction
                        ) => {
                          return await mid.middleware(req, res, next);
                        },
                        this.errorHandler
                      );
                    }
                  } else if (typeof middleware === 'function') {
                    this.debugLog(
                      'Method Middleware loaded %o',
                      middleware.name
                    );
                    ret = AsyncMiddleware(
                      async (
                        req: ExpressRequest,
                        res: ExpressResponse,
                        next: NextFunction
                      ) => {
                        return await middleware(req, res, next);
                      },
                      this.errorHandler
                    );
                  }
                } catch {}

                return ret;
              })
              .filter((middleware) => !!middleware) as RequestHandler<
              any,
              any,
              any
            >[];
          }

          middlewares = [
            ...middlewares,
            AsyncRoute(
              async (
                req: ExpressRequest,
                res: ExpressResponse,
                next: NextFunction
              ) => {
                const params: any[] = paramsInfo.map((paramName) =>
                  getParamValue(paramName, req, res, next)
                );

                await action.instance[functionData.name](...params);

                if (!res.headersSent) {
                  res.status(500).json({
                    success: false,
                    message: 'No response was added for this route'
                  });
                }
              },
              this.errorHandler
            )
          ];

          router[functionData.method](child, ...middlewares);
        });

        this.lock.acquire('app-middleware-injector', (done) => {
          try {
            this.application?.use(apiPath, router);
          } catch {}
          done();
        });
      } catch (e) {
        this.debugError(e);
      }
    });

    // Define default 404 error for api
    try {
      this.lock?.acquire('app-middleware-injector', (done) => {
        try {
          this.application?.use(
            this.config?.apiPrefix ?? '',
            AsyncRoute(
              async (
                req: ExpressRequest,
                res: ExpressResponse,
                next: NextFunction
              ) => {
                return await this.notFoundHandler(req, res, next);
              },
              this.errorHandler
            )
          );
        } catch {}
        done();
      });
    } catch {}

    // Define the Static Files
    if (this.config?.staticFiles && this.getAbsolutePath) {
      const { staticFiles } = this.config;
      if (!Array.isArray(staticFiles)) {
        this.injectStaticFiles(staticFiles);
      } else {
        staticFiles.forEach((engine) => this.injectStaticFiles(engine));
      }
    }

    // Define default 404 error for static files
    try {
      this.lock?.acquire('app-middleware-injector', (done) => {
        try {
          this.application?.use(
            '*',
            AsyncRoute(
              async (
                req: ExpressRequest,
                res: ExpressResponse,
                next: NextFunction
              ) => {
                return await this.notFoundHandler(req, res, next);
              },
              this.errorHandler
            )
          );

          this.application?.use((error: any, req: any, res: any, next: any) =>
            this.errorHandler(req, res, next, error)
          );
        } catch {}
        done();
      });
    } catch {}
  }

  private injectStaticFiles(staticFiles: StaticFiles) {
    const router = ExpressRouter();
    router.use(
      `${`${staticFiles.path ?? '/'}`.trim()}`,
      express.static(this.getAbsolutePath(...staticFiles.directory))
    );
    router.get(`${`${staticFiles.path ?? '/'}`.trim()}*`, (req, res) =>
      res.sendFile(this.getAbsolutePath(...staticFiles.directory, 'index.html'))
    );

    try {
      this.lock?.acquire('app-middleware-injector', (done) => {
        try {
          if (!staticFiles.subdomain) {
            this.application?.use(router);
          } else {
            this.application?.use(
              this.subdomainMiddleware(staticFiles.subdomain, router)
            );
          }
        } catch {}
        done();
      });
    } catch {}

    this.debugLog('Static Files Route loaded %o', staticFiles.path);
  }

  private subdomainMiddleware = (subdomain: string, fn: Function) => (
    req: ExpressRequest,
    res: ExpressResponse,
    next: NextFunction
  ) => {
    const host = req.headers.host?.toString().split(':')[0];
    if (!host) {
      return next();
    }

    const subdomains = host
      .split('.')
      .filter((x: any) => !!x && x.toString().trim() !== '');
    if (subdomains.join('.').trim().startsWith(subdomain.toString().trim())) {
      return fn(req, res, next);
    } else {
      return next();
    }
  };
}
