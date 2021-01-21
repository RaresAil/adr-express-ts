# ADR Express TypeScript

![Build](https://github.com/RaresAil/adr-express-ts/workflows/Build/badge.svg)
![EADIT-CLI CI](https://github.com/RaresAil/eadit-cli/workflows/EADIT-CLI%20CI/badge.svg)

- [Documentation](https://raresail.github.io/adr-express-ts/)
- [GitHub](https://github.com/RaresAil/adr-express-ts)
- [NPM](https://www.npmjs.com/package/adr-express-ts)

This package is a dependency injection for express with typescript using decorators and the [Action–Domain–Responder](https://en.wikipedia.org/wiki/Action–domain–responder) pattern.

## Getting Started

#### Create

Use my CLI to create the application. Instead of "myFolderName" you can add "." to install it in the current directory.
Always use `npx` to use the latest version of the CLI.

```zsh
npx eadit-cli create myFolderName
```

#### Template Check

You will be asked to choose a template. For this one you have to select `Express`

```zsh
? What template do you want? (Use arrow keys)
❯ Express
  Discord.js
```

#### Path Check

You will get the following question:

```zsh
? Is the path correct? ('/my/path/to/application') (Y/n)
```

If the path is correct respond with `Y` or press `Enter`

#### Yarn Check

If you have Yarn installed, the CLI will ask if you want to use it, if you say `N` npm will be used.

```zsh
? Yarn was detected on your system, do you want to use Yarn? (Y/n)
```

#### Dependency Selector

For the next part you can choose if you need more dependencies (They will be automaticly injected).
![Question 2](scripts/resources/cli-q-2.png)

#### Dialect Selector (Only for Sequelize) and complete extra information

If you choose `Sequelize`, you will also be asked to choose which dialect you want and to complete the connection information.
![Question 3](scripts/resources/cli-q-3.png)

#### Check if directory is empty

If the directory you want to create the application is not empty, you will be asked if you want to remove all files from it. If you don't remove the files the project will not be created.

```zsh
? The current directory is not empty, do you want to clear it? (y/N)
```

#### Finish

After everything is installed, you should see the following output.
![Final](scripts/resources/cli-q-final.png)

## About Action–Domain–Responder

- The action takes HTTP requests (URLs and their methods) and uses that input to interact with the domain, after which it passes the domain's output to one and only one responder.
- The domain can modify state, interacting with storage and/or manipulating data as needed. It contains the business logic.
- The responder builds the entire HTTP response from the domain's output which is given to it by the action.
- The entity is the model for the database

## Project structure

```markdown
/src

# Here you define the tests, there are default tests defined.

- /**tests**

- /actions

# Here you define the route and the methods (get, post, put, delete)

# Are automatically injectetd!

- - action.ts

- /app

# Here you start the server (app.listen) and other checks before/after starting.

- - Server.ts

- /domain
- - /entities

# Here you define the entiry (They are accessed with @Retrive('Entity.NAME') or from your ORM)

# Are automatically injectetd!

- - - entity.ts

# Here you define the domain (They are accessed with @Retrive('Domain.NAME'))

# Are automatically injectetd!

- - domain.ts

- /middlewares

# Here you define middlewares (as classes).

# You inject them manually

- - middleware.ts

/public

# In public (depends on the Configuration made in index.ts) you have the front-end,

# all routes point to index.html (i made it so it can work with React)

- - index.html

- /responders

# Here you define the domains (They are accessed with @Retrive('Responder.NAME'))

# Are automatically injectetd!

- - responder.ts

# Here you inject classes, middlewares, variables, functions, server, router, etc.

# And you have to call Injector.ready(); when you finished all your injections.

- index.ts
```

## Configuration

```js
Injector.inject(
  'Configuration',
  {
    root: __dirname,
    restPrefix: '/api',
    debug: {
      log: console.log,
      error: console.error
    },
    renderEngine: {
      path: '/',
      directory: ['public']
    }
  } as Configuration,
  InjectType.Variable
);
```
