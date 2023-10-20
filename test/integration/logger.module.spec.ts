/* eslint-disable unused-imports/no-unused-vars */
import { Inject, Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { LogService, RootLogger } from '@tgarif/logger';
import { MockLogService, MockRootLogger } from '@tgarif/logger/mocks';
import * as assert from 'assert';

import { LOGGER, LoggerModule } from '../../src/logger.module';

describe('LoggerModule', () => {
  describe('as global (default)', () => {
    it('boots successfully', async () => {
      const logger = new MockRootLogger('test');

      const rootModule = await Test.createTestingModule({
        imports: [LoggerModule.forRoot(logger as unknown as RootLogger)],
      }).compile();

      const app = rootModule.createNestApplication();
      await app.init();
    });

    it('is usable', async () => {
      @Injectable()
      class FooService {
        constructor(@Inject(LOGGER) private log: LogService) {}

        logFoo() {
          this.log.info('foo');
        }
      }

      const logger = new MockRootLogger('mytestnamespace');
      const rootModule = await Test.createTestingModule({
        imports: [LoggerModule.forRoot(logger as unknown as RootLogger)],
        providers: [FooService],
      }).compile();

      const app = rootModule.createNestApplication();
      await app.init();

      const fooService = rootModule.get<FooService>(FooService);
      fooService.logFoo();

      expect(logger.info.callCount).toEqual(1);
      expect(logger.info.lastCall.lastArg).toEqual('foo');
    });

    it('is usable on sibling feature modules', async () => {
      let logger: MockRootLogger;
      let injectedLogService: MockLogService;

      @Injectable()
      class FooService {
        constructor(@Inject(LOGGER) private log: MockLogService) {
          injectedLogService = this.log;
        }

        logFoo() {
          this.log.info('foo');
        }
      }

      @Module({
        providers: [FooService],
      })
      class FooModule {}

      @Injectable()
      class ConfigService {
        getLogNamespace() {
          return 'mytestnamespace';
        }
      }

      @Module({
        providers: [ConfigService],
        exports: [ConfigService],
      })
      class ConfigModule {}

      @Module({
        imports: [
          LoggerModule.forRootAsync({
            isGlobal: false,
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
              logger = new MockRootLogger(configService.getLogNamespace());

              return {
                // Cast to RootLogger is intentional to silence type issue
                logger: logger as unknown as RootLogger,
              };
            },
            inject: [ConfigService],
          }),
        ],
      })
      class AppModule {}

      try {
        await Test.createTestingModule({
          imports: [FooModule, AppModule],
        }).compile();

        throw new Error('should be thrown');
      } catch (err) {
        assert(err instanceof Error);
        expect(err.message).not.toBe('should be thrown');
      }
    });

    describe('async dynamic module', () => {
      let logger: MockRootLogger;
      let logService: LogService;
      let injectedLogService: MockLogService;

      beforeEach(async () => {
        @Injectable()
        class FooService {
          constructor(@Inject(LOGGER) private log: MockLogService) {
            injectedLogService = this.log;
          }

          logFoo() {
            this.log.info('foo');
          }
        }

        @Injectable()
        class ConfigService {
          getLogNamespace() {
            return 'mytestnamespace';
          }
        }

        @Module({
          providers: [ConfigService],
          exports: [ConfigService],
        })
        class ConfigModule {}

        const rootModule = await Test.createTestingModule({
          imports: [
            LoggerModule.forRootAsync({
              imports: [ConfigModule],
              useFactory: async (configService: ConfigService) => {
                logger = new MockRootLogger(configService.getLogNamespace());

                return {
                  // Cast to RootLogger is intentional to silence type issue
                  logger: logger as unknown as RootLogger,
                };
              },
              inject: [ConfigService],
            }),
          ],
          providers: [FooService],
        }).compile();

        const app = rootModule.createNestApplication();
        await app.init();

        logService = rootModule.get(LOGGER);

        const fooService = rootModule.get<FooService>(FooService);
        fooService.logFoo();
      });

      it('should boot successfully', async () => {
        expect(logService instanceof LogService).toBeTruthy();
      });

      it('should have been configured correctly', async () => {
        expect(logService.namespace).toEqual('mytestnamespace');
      });

      it('should provide LOGGER to feature module', async () => {
        expect(injectedLogService).toBeDefined();
      });

      it('should provide a LogService to feature module via LOGGER', async () => {
        expect(injectedLogService instanceof LogService).toBeTruthy();
      });

      it('should call the passed rootLogger', async () => {
        expect(logger.info.callCount).toBe(1);
      });
    });
  });

  describe('as non-global', () => {
    it('boots successfully', async () => {
      const logger = new MockRootLogger('mytestnamespace');

      const rootModule = await Test.createTestingModule({
        imports: [
          LoggerModule.forRoot(logger as unknown as RootLogger, {
            isGlobal: false,
          }),
        ],
      }).compile();

      const app = rootModule.createNestApplication();
      await app.init();
    });

    it('is usable in root module', async () => {
      @Injectable()
      class FooService {
        constructor(@Inject(LOGGER) private log: LogService) {}

        logFoo() {
          this.log.info('foo');
        }
      }

      const logger = new MockRootLogger('mytestnamespace');
      const rootModule = await Test.createTestingModule({
        imports: [
          LoggerModule.forRoot(logger as unknown as RootLogger, {
            isGlobal: false,
          }),
        ],
        providers: [FooService],
      }).compile();

      const app = rootModule.createNestApplication();
      await app.init();

      const fooService = rootModule.get<FooService>(FooService);
      fooService.logFoo();

      expect(logger.info.callCount).toEqual(1);
      expect(logger.info.lastCall.lastArg).toEqual('foo');
    });

    describe('async dynamic module', () => {
      let logger: MockRootLogger;
      let logService: LogService;
      let injectedLogService: MockLogService;

      beforeEach(async () => {
        @Injectable()
        class FooService {
          constructor(@Inject(LOGGER) private log: MockLogService) {
            injectedLogService = this.log;
          }

          logFoo() {
            this.log.info('foo');
          }
        }

        @Injectable()
        class ConfigService {
          getLogNamespace() {
            return 'mytestnamespace';
          }
        }

        @Module({
          providers: [ConfigService],
          exports: [ConfigService],
        })
        class ConfigModule {}

        const rootModule = await Test.createTestingModule({
          imports: [
            LoggerModule.forRootAsync({
              imports: [ConfigModule],
              useFactory: async (configService: ConfigService) => {
                logger = new MockRootLogger(configService.getLogNamespace());

                return {
                  // Cast to RootLogger is intentional to silence type issue
                  logger: logger as unknown as RootLogger,
                  isGlobal: false,
                };
              },
              inject: [ConfigService],
            }),
          ],
          providers: [FooService],
        }).compile();

        const app = rootModule.createNestApplication();
        await app.init();

        logService = rootModule.get(LOGGER);

        const fooService = rootModule.get<FooService>(FooService);
        fooService.logFoo();
      });

      it('should boot successfully', async () => {
        expect(logService instanceof LogService).toBeTruthy();
      });

      it('should have been configured correctly', async () => {
        expect(logService.namespace).toEqual('mytestnamespace');
      });

      it('should call the passed rootLogger', async () => {
        expect(logger.info.callCount).toBe(1);
      });
    });

    describe('async dynamic module with sibling feature module', () => {
      let logger: MockRootLogger;
      let injectedLogService: MockLogService;

      it('should throw on init', async () => {
        @Injectable()
        class FooService {
          constructor(@Inject(LOGGER) private log: MockLogService) {
            injectedLogService = this.log;
          }

          logFoo() {
            this.log.info('foo');
          }
        }

        @Module({
          providers: [FooService],
        })
        class FooModule {}

        @Injectable()
        class ConfigService {
          getLogNamespace() {
            return 'mytestnamespace';
          }
        }

        @Module({
          providers: [ConfigService],
          exports: [ConfigService],
        })
        class ConfigModule {}

        @Module({
          imports: [
            LoggerModule.forRootAsync({
              isGlobal: false,
              imports: [ConfigModule],
              useFactory: async (configService: ConfigService) => {
                logger = new MockRootLogger(configService.getLogNamespace());

                return {
                  // Cast to RootLogger is intentional to silence type issue
                  logger: logger as unknown as RootLogger,
                };
              },
              inject: [ConfigService],
            }),
          ],
        })
        class AppModule {}

        try {
          await Test.createTestingModule({
            imports: [FooModule, AppModule],
          }).compile();

          throw new Error('should not be thrown');
        } catch (err) {
          assert(err instanceof Error);
          expect(err.message).not.toBe('should not be thrown');
        }
      });
    });
  });
});
