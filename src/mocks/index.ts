import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { LogLevels } from '@tgarif/logger';
import { MockLogService } from '@tgarif/logger/mocks';

import { LOGGER } from '..';
import { loggerNamespaces } from '../inject-logger.decorator';

@Global()
@Module({})
export class MockNestjsLoggerModule {
  static forRoot(
    rootNamespace: string,
    debugLevel: LogLevels | 'silent' = 'silent',
  ): DynamicModule {
    const providers: Provider[] = [
      {
        provide: LOGGER,
        useFactory: () => new MockLogService(rootNamespace, debugLevel),
      },
    ];

    for (const [childNamespace, [injectionToken /* , rawChildOptions*/]] of Array.from(
      loggerNamespaces,
    )) {
      providers.push({
        provide: injectionToken,
        useFactory: () => {
          if (typeof childNamespace === 'string') {
            return new MockLogService(`${rootNamespace}:${childNamespace}`, debugLevel);
          } else {
            // Currently, the only symbol identifies the root logger. [ta]
            return new MockLogService(rootNamespace);
          }
        },
      });
    }

    return {
      module: MockNestjsLoggerModule,
      providers,
      exports: providers,
    };
  }
}
