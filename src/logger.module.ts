import { DynamicModule, Module, Provider } from '@nestjs/common';
import { LogService, RootLogger } from '@tgarif/logger';

import { loggerNamespaces } from './inject-logger.decorator';
import {
  LOGGER_MODULE_OPTIONS,
  LoggerModuleAsyncOptions,
  LoggerModuleLegacyOptions,
  LoggerModuleOptions,
} from './types';

export const LOGGER = Symbol('LOGGER');

@Module({})
export class LoggerModule {
  static forRoot(
    logger: RootLogger,
    options: Partial<LoggerModuleLegacyOptions> = {},
  ): DynamicModule {
    options = Object.assign(
      {
        isGlobal: true,
      },
      options || {},
    );

    const providers: Provider[] = [...this.createLoggerProviders()];

    return {
      module: LoggerModule,
      global: !!options.isGlobal,
      providers: [
        {
          provide: LOGGER_MODULE_OPTIONS,
          useValue: {
            logger,
            isGlobal: !!options.isGlobal,
          },
        },
        ...providers,
      ],
      exports: providers,
    };
  }

  static forRootAsync(options: LoggerModuleAsyncOptions): DynamicModule {
    const providers: Provider[] = [...this.createLoggerProviders()];

    return {
      module: LoggerModule,
      global: options.isGlobal === false ? false : true,
      imports: options.imports,
      providers: [
        {
          provide: LOGGER_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        ...providers,
      ],
      exports: providers,
    };
  }

  // static forFeature(): DynamicModule {
  //   return {
  //     module: LoggerModule,
  //   };
  // }

  private static createLoggerProviders(): Provider[] {
    const providers: Provider[] = [
      {
        provide: LOGGER,
        useFactory: (loggerModuleOptions: LoggerModuleOptions) =>
          new LogService(loggerModuleOptions.logger),
        inject: [LOGGER_MODULE_OPTIONS],
      },
    ];

    for (const [logNamespace, [injectionToken, rawChildOptions]] of Array.from(loggerNamespaces)) {
      providers.push({
        provide: injectionToken,
        useFactory: (loggerModuleOptions: LoggerModuleOptions) => {
          if (typeof logNamespace === 'string') {
            return new LogService(
              loggerModuleOptions.logger.createLogger(logNamespace, rawChildOptions),
            );
          } else {
            // Currently, the only symbol identifies the root logger. [ta]
            return new LogService(loggerModuleOptions.logger);
          }
        },
        inject: [LOGGER_MODULE_OPTIONS],
      });
    }

    return providers;
  }
}
