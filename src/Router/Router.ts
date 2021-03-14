/* eslint-disable require-jsdoc */
import rateLimit from 'express-rate-limit';
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
import { AsyncCallback, HandleMiddleware } from '../utils';
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
    return path.join.apply(null, [
      path.dirname(this.config!.rootFile),
      ...args
    ]);
  }

  private get APIPrefix() {
    if (!this.config?.apiPrefix) {
      throw new Error('The configuration is not Injected!');
    }

    const prefix = this.config.apiPrefix;
    return prefix.startsWith('/') ? prefix : `/${prefix}`;
  }

  private isValidFile(fileName: string): boolean {
    if (path.extname(fileName) === path.extname(this.config!.rootFile)) {
      return true;
    }

    return false;
  }

  constructor() {
    this.lock = new AsyncLock();

    if (!this.config?.rootFile || !this.config?.apiPrefix) {
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
    this.injectActions(this.getAbsolutePath('actions'), '');

    const isSamePath = this.isApiTheSameAsStatic();

    if (!isSamePath) {
      this.injectPathErrors();
    }

    this.injectAllStaticFiles();

    if (isSamePath) {
      this.injectPathErrors();
    }
    this.injectStaticFilesPathErrors();
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
                  HandleMiddleware(
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
                HandleMiddleware(
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
    if (!fs.existsSync(this.getAbsolutePath('domain', 'entities'))) {
      return;
    }

    fs.readdirSync(this.getAbsolutePath('domain', 'entities')).map(
      (name: string) => {
        if (!this.isValidFile(name)) {
          return;
        }

        try {
          let ent;
          try {
            ent = require(this.getAbsolutePath('domain', 'entities', name));
          } catch (e) {
            this.debugError(e);
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
    if (!fs.existsSync(this.getAbsolutePath('domain'))) {
      return;
    }

    fs.readdirSync(this.getAbsolutePath('domain')).map((name: string) => {
      if (!this.isValidFile(name)) {
        return;
      }

      try {
        let dom;

        try {
          dom = require(this.getAbsolutePath('domain', name));
        } catch (e) {
          this.debugError(e);
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
    if (!fs.existsSync(this.getAbsolutePath('responders'))) {
      return;
    }

    fs.readdirSync(this.getAbsolutePath('responders')).map((name: string) => {
      if (!this.isValidFile(name)) {
        return;
      }

      try {
        let resp;

        try {
          resp = require(this.getAbsolutePath('responders', name));
        } catch (e) {
          this.debugError(e);
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

  private injectActions(actionsPathRoot: string, actionsPrefix: string) {
    if (!fs.existsSync(actionsPathRoot)) {
      return;
    }

    fs.readdirSync(actionsPathRoot).map((name: string) => {
      const actionPath = path.join(actionsPathRoot, name);
      try {
        if (!this.lock) {
          return;
        }

        const isDir = fs.lstatSync(actionPath).isDirectory();
        if (isDir) {
          const dirName = path.basename(actionPath);
          this.injectActions(
            actionPath,
            dirName.startsWith('/') ? dirName : `/${dirName}`
          );
          return;
        }

        if (!this.isValidFile(actionPath)) {
          return;
        }

        const ac = require(actionPath);
        if (!ac || !ac.default) {
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

        const apiPath = [this.APIPrefix, actionsPrefix, action.path ?? '']
          .join('')
          .trim()
          .replace(/\/\//gm, '/');

        if (apiPath?.trim() === '' || !action?.path) {
          return;
        }

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
            paramsInfo[parseInt(paramPosition)] = paramTarget;
          });

          this.debugLog(
            'Action loaded %o %s %o',
            functionData.method.toUpperCase(),
            `${apiPath}${child}`,
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
  }

  private isApiTheSameAsStatic(): boolean {
    let check: boolean = false;

    if (this.config?.staticFiles && this.getAbsolutePath) {
      const { staticFiles } = this.config;
      if (
        !Array.isArray(staticFiles) &&
        this.staticFilesPath(staticFiles).includes(this.APIPrefix) &&
        staticFiles.disableIndexRouter
      ) {
        check = !!staticFiles.disableIndexRouter;
      }
    }

    return check;
  }

  private injectPathErrors() {
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
  }

  private injectAllStaticFiles() {
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
  }

  private injectStaticFilesPathErrors() {
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

  private staticFilesPath(staticFiles: StaticFiles | StaticFilesSubdomain) {
    return staticFiles.path.startsWith('/')
      ? staticFiles.path.trim()
      : `/${staticFiles.path.trim()}`;
  }

  private injectStaticFiles(staticFiles: StaticFiles | StaticFilesSubdomain) {
    const staticPath = this.staticFilesPath(staticFiles);

    if (staticPath.includes(this.APIPrefix)) {
      if (
        Array.isArray(this.config!.staticFiles) ||
        (!Array.isArray(this.config!.staticFiles) &&
          !staticFiles.disableIndexRouter)
      ) {
        throw new Error("The static files path can't include the API prefix!");
      }
    }

    const router = ExpressRouter();
    let middlewares: RouteCallback[] = (staticFiles.middlewares ?? [])
      .map((middleware) => {
        if (typeof middleware === 'string') {
          const mid = Injector.get<Middleware | undefined | null>(middleware);
          if (!mid) {
            return null;
          }

          this.debugLog('Static Files Middleware loaded %o', middleware);
          return HandleMiddleware(
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
          return HandleMiddleware(
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

    if (staticFiles.rateLimitOptions) {
      middlewares = [
        AsyncCallback(
          rateLimit(staticFiles.rateLimitOptions) as any,
          this.errorHandler
        ),
        ...middlewares
      ];
    }

    if (middlewares.length > 0) {
      router.use(...middlewares);
    }

    if (staticFiles.customStaticHandler) {
      router.use(
        staticFiles.customStaticHandler(
          this.getAbsolutePath(...staticFiles.directory)
        )
      );
    } else {
      router.use(
        express.static(
          this.getAbsolutePath(...staticFiles.directory),
          staticFiles.options
        )
      );
    }

    if (!staticFiles.disableIndexRouter) {
      router.get('/*', (req, res) =>
        res.sendFile(
          this.getAbsolutePath(
            ...staticFiles.directory,
            staticFiles.indexFileName ?? 'index.html'
          )
        )
      );
    }

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
