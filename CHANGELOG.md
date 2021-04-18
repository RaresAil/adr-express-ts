# Change Log

All notable changes to this project will be documented in this file.

## **v2.0.0**

### Added

- More HTTP Metods
- @Body decorator for methods
- @Query decorator for methods
- @Params decorator for methods
- Add constructor hashing for injector
- Prepare library to support sub-modules, e.g. to can add a Swagger OpenApi automated generator
- The package name will be renamed from **adr-express-ts** to **@adr-express-ts/core**

## **v1.2.2**

### Added

- RE2 for Regex

## **v1.2.1**

### Fixed

- Allow the api and the static files on the same path when the `disableIndexRouter` is set to `true` and when is only one and `staticFiles` is an object.

## **v1.2.0**

### Added

- Option to disable the static file router to index.html
- Option to change the static file handler
- Option to change the index.html file name
