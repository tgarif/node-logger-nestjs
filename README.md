# @tgarif/logger-nestjs

[![npm](https://img.shields.io/npm/v/@tgarif/logger-nestjs?color=a1b858&label=)](https://npmjs.com/package/@tgarif/logger-nestjs)

## Installation

```bash
npm i @tgarif/logger-nestjs
```

## Usage

```typescript
import { Module, Injectable, Inject } from '@nestjs/common';
import { createLogger, LogService } from '@tgarif/logger';
import { LoggerModule, LOGGER } from '@tgarif/logger-nestjs';

const logger = createLogger('app');

@Module({
  imports: [LoggerModule.forRoot(logger)],
  providers: [HelperService],
})
export class AppModule {}

@Injectable()
class HelperService {
  constructor(@Inject(LOGGER) private log: LogService) {}

  logFoo() {
    this.log.info('foo');
  }

  logChild() {
    this.log.createLogger('childLogger').info('child foo');
  }
}
```

#### The `@InjectLogger()` Decorator

As a preferred alternative, a child logger can be injected directly, without
having to inject the root log service to create a logger in a second
step.

The `@InjectLogger()` decorator takes a **namespace string as argument**.

If no argument is passed, the root LogService is returned.

```typescript
import { Module, Injectable, Inject } from '@nestjs/common';
import { createLogger, LogService } from '@tgarif/logger';
import { LoggerModule, InjectLogger } from '@tgarif/logger-nestjs';

const logger = createLogger('app');

@Module({
  imports: [LoggerModule.forRoot(logger)],
  providers: [HelperService],
})
export class AppModule {}

@Injectable()
class HelperService {
  constructor(
    @InjectLogger('helper') private log: LogService,
    @InjectLogger() private rootLog: LogService,
  ) {}

  logFoo() {
    // This will output "INFO [app:helper] foo"
    this.log.info('foo');
  }

  logRootFoo() {
    // This will output "INFO [app] foo"
    this.rootLog.info('foo');
  }

  logChild() {
    // This will NOT work here, our logger is already a child logger.
    // this.log.createLogger('childLogger').info('child foo');
  }
}
```

## License

[MIT](./LICENSE) License &copy; 2023-PRESENT [Tengku Arif](https://github.com/tgarif)
