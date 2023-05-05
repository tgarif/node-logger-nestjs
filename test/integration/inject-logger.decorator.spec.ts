import { Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { LogService, RootLogger } from '@tgarif/logger';
import { MockRootLogger } from '@tgarif/logger/mocks';

import { InjectLogger } from '../../src/inject-logger.decorator';
import { LoggerModule } from '../../src/logger.module';

describe('@InjectLogger()', () => {
  describe('with static provider', () => {
    describe('without namespace', () => {
      let logger: MockRootLogger;
      let injectedLogService: LogService;

      beforeEach(async () => {
        @Injectable()
        class FooService {
          constructor(@InjectLogger() private log: LogService) {
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

        logger = new MockRootLogger('mytestnamespace');
        const rootModule = await Test.createTestingModule({
          imports: [LoggerModule.forRoot(logger as unknown as RootLogger), FooModule],
        }).compile();

        const app = rootModule.createNestApplication();
        await app.init();

        const fooService = rootModule.get<FooService>(FooService);
        fooService.logFoo();
      });

      it('should inject a LogService for the root namespace', async () => {
        expect(injectedLogService.namespace).toBe('mytestnamespace');
      });

      it('should inject a LogService that calls the root logger', async () => {
        expect(logger.info.callCount).toBe(1);
      });
    });

    describe('with namespace', () => {
      let logger: MockRootLogger;
      let injectedLogService: LogService;

      beforeEach(async () => {
        @Injectable()
        class FooService {
          constructor(@InjectLogger('child') private log: LogService) {
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

        logger = new MockRootLogger('mytestnamespace');
        const rootModule = await Test.createTestingModule({
          imports: [LoggerModule.forRoot(logger as unknown as RootLogger), FooModule],
        }).compile();

        const app = rootModule.createNestApplication();
        await app.init();

        const fooService = rootModule.get<FooService>(FooService);
        fooService.logFoo();
      });

      it('should inject a LogService for the child namespace', async () => {
        expect(injectedLogService.namespace).toBe('mytestnamespace:child');
      });
    });
  });

  describe('with async provider', () => {
    describe('without namespace', () => {
      let logger: MockRootLogger;
      let injectedLogService: LogService;

      beforeEach(async () => {
        @Injectable()
        class FooService {
          constructor(@InjectLogger() private log: LogService) {
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

        const rootModule = await Test.createTestingModule({
          imports: [
            FooModule,
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
        }).compile();

        const app = rootModule.createNestApplication();
        await app.init();

        const fooService = rootModule.get<FooService>(FooService);
        fooService.logFoo();
      });

      it('should inject a LogService for the root namespace', async () => {
        expect(injectedLogService.namespace).toBe('mytestnamespace');
      });

      it('should inject a LogService that calls the root logger', async () => {
        expect(logger.info.callCount).toBe(1);
      });
    });
  });
});
