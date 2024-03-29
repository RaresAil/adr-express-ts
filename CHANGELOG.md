# Change Log

All notable changes to this project will be documented in this file.

## **v2.2.4**

- Fixed `tar` audit

## **v2.2.3**

- Updated deps

## **v2.2.2**

- Updated deps

## **v2.2.0**

- Updated deps

### Added

- Added RE2

## **v2.1.3**

- Updated deps

## **v2.1.2**

- Updated deps

## **v2.1.1**

- Updated deps

## **v2.1.1**

### Removed

- RE2

## **v2.1.0**

### Removed

- Removed express-rate-limit as a required dependency

### Fixes

- Typos

## **v2.0.0**

### Added

- More HTTP Methods
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
