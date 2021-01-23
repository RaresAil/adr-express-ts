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
import { Action, Middleware, RouteCallback } from '../@types';
import { AsyncCallback, APIMiddleware } from '../utils';
import ExpressTS from '../app/ExpressTS';
import { getParamValue } from './Params';
import {
  defaultNotFoundHandler,
  StaticFilesSubdomain,
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

  private get APIPrefix() {
    if (!this.config?.apiPrefix) {
      throw new Error('The configuration is not Injected!');
    }

    const prefix = this.config.apiPrefix;
    return prefix.startsWith('/') ? prefix : `/${prefix}`;
  }

  constructor() {
    this.lock = new AsyncLock();

    if (!this.config?.root || !this.config?.apiPrefix) {
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
      this.middlewares.map((middleware) => {
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
                  APIMiddleware(
                    AsyncCallback(
                      async (
                        req: ExpressRequest,
                        res: ExpressResponse,
                        next: NextFunction
                      ) => {
                        return await mid.middleware(req, res, next);
                      },
                      this.errorHandler
                    ),
                    this.APIPrefix,
                    'api'
                  )
                );
              }
            } else if (typeof middleware === 'function') {
              this.debugLog('Global Middleware loaded %o', middleware.name);
              this.application?.use(
                APIMiddleware(
                  AsyncCallback(
                    async (
                      req: ExpressRequest,
                      res: ExpressResponse,
                      next: NextFunction
                    ) => {
                      return await middleware(req, res, next);
                    },
                    this.errorHandler
                  ),
                  this.APIPrefix,
                  'api'
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
    fs.readdirSync(this.getAbsolutePath('domain', 'entities')).map(
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
    fs.readdirSync(this.getAbsolutePath('domain')).map((name: string) => {
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
    fs.readdirSync(this.getAbsolutePath('responders')).map((name: string) => {
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
    });
  }

  private injectActions() {
    fs.readdirSync(this.getAbsolutePath('actions')).map((name: string) => {
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
          (ExpressTS.getData(targetName, 'functionParams') as any[]) ?? [];
        if (!action?.target || action?.functions?.length <= 0) {
          return;
        }

        if (!this.application || !this.config) {
          return;
        }

        let apiPath = [this.APIPrefix, action.path ?? ''].join('');

        if (!apiPath || apiPath.trim() === '' || !action?.path) {
          return;
        }

        apiPath = apiPath.trim();
        const router = ExpressRouter();

        if (action.middlewares && Array.isArray(action.middlewares)) {
          action.middlewares.map((middleware) => {
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
                      AsyncCallback(
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
                    AsyncCallback(
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

        action.functions.map((functionData) => {
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
          paramsInfoRaw.map(({ index: paramPosition, target: paramTarget }) => {
            paramsInfo[paramPosition] = paramTarget;
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
                      ret = AsyncCallback(
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
                    ret = AsyncCallback(
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
            AsyncCallback(
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
            this.APIPrefix,
            AsyncCallback(
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
        [...staticFiles]
          .sort(
            (sfA, sfB) =>
              (sfB.subdomain?.length ?? 0) - (sfA.subdomain?.length ?? 0)
          )
          .map((engine) => this.injectStaticFiles(engine));
      }
    }

    // Define default 404 error for static files
    try {
      this.lock?.acquire('app-middleware-injector', (done) => {
        try {
          this.application?.use(
            '*',
            AsyncCallback(
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

  private injectStaticFiles(staticFiles: StaticFiles | StaticFilesSubdomain) {
    const staticPath = staticFiles.path.startsWith('/')
      ? staticFiles.path.trim()
      : `/${staticFiles.path.trim()}`;
    const router = ExpressRouter();

    const middlewares: RouteCallback[] = (staticFiles.middlewares ?? [])
      .map((middleware) => {
        if (typeof middleware === 'string') {
          const mid = Injector.get<Middleware | undefined | null>(middleware);
          if (!mid) {
            return null;
          }

          this.debugLog('Static Files Middleware loaded %o', middleware);
          return APIMiddleware(
            AsyncCallback(
              async (
                req: ExpressRequest,
                res: ExpressResponse,
                next: NextFunction
              ) => {
                return await mid.middleware(req, res, next);
              },
              this.errorHandler
            ),
            this.APIPrefix,
            'render'
          );
        } else if (typeof middleware === 'function') {
          this.debugLog('Static Files Middleware loaded %o', middleware.name);
          return APIMiddleware(
            AsyncCallback(
              async (
                req: ExpressRequest,
                res: ExpressResponse,
                next: NextFunction
              ) => {
                return await middleware(req, res, next);
              },
              this.errorHandler
            ),
            this.APIPrefix,
            'render'
          );
        }

        return null;
      })
      .filter((m) => !!m) as RouteCallback[];

    router.use(...middlewares);
    router.use(express.static(this.getAbsolutePath(...staticFiles.directory)));
    router.get('/*', (req, res) =>
      res.sendFile(this.getAbsolutePath(...staticFiles.directory, 'index.html'))
    );

    try {
      this.lock?.acquire('app-middleware-injector', (done) => {
        try {
          if (!staticFiles.subdomain) {
            this.application?.use(staticPath, router);
          } else {
            this.application?.use(
              staticPath,
              this.subdomainMiddleware(staticFiles.subdomain, router)
            );
          }
        } catch {}
        done();
      });
    } catch {}

    this.debugLog(
      `Static Files Route loaded %o ${
        staticFiles.subdomain ? 'for subdomain %o' : ''
      }`,
      staticFiles.path,
      staticFiles.subdomain ?? ''
    );
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