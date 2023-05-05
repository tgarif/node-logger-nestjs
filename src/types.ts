import { ModuleMetadata } from '@nestjs/common/interfaces';
import { RootLogger } from '@tgarif/logger';

export const LOGGER_MODULE_OPTIONS = Symbol('LOGGER_MODULE_OPTIONS');

export interface LoggerModuleOptions {
  logger: RootLogger;
}

export interface LoggerModuleLegacyOptions {
  isGlobal: boolean;
}

export interface LoggerModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  isGlobal?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory: (...args: any[]) => Promise<LoggerModuleOptions> | LoggerModuleOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inject?: any[];
}
