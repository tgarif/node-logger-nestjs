import { Inject } from '@nestjs/common';
import { CreateChildLoggerOptions } from '@tgarif/logger';

const TOKEN_PREFIX_BASE = 'LOGGER__';
// We need the additional '_' to prevent accidental overlap with the root logger. [ta]
export const TOKEN_PREFIX = TOKEN_PREFIX_BASE + '_';
export const ROOT_LOGGER_TOKEN = Symbol('ROOT_LOGGER');

export const loggerNamespaces: Map<
  string | symbol,
  [string, CreateChildLoggerOptions | undefined]
> = new Map();

export function InjectLogger(
  childNamespace?: string,
  rawChildOptions?: CreateChildLoggerOptions,
): ReturnType<typeof Inject> {
  const injectionToken = getLoggerTokenFor(childNamespace);

  if (childNamespace) {
    if (!loggerNamespaces.has(childNamespace)) {
      loggerNamespaces.set(childNamespace, [injectionToken, rawChildOptions]);
    }

    // We need the additional '_' to prevent accidental overlap with the root logger. [ta]
    return Inject(injectionToken);
  } else {
    loggerNamespaces.set(ROOT_LOGGER_TOKEN, [injectionToken, undefined]);
    return Inject(injectionToken);
  }
}

export function getLoggerTokenFor(childNamespace?: string): string {
  if (childNamespace) {
    return TOKEN_PREFIX + childNamespace;
  } else {
    return TOKEN_PREFIX_BASE + 'ROOT';
  }
}
