import { TransformableInfo } from 'logform';
import {
  Logger,
  LoggerOptions,
  createLogger,
  format,
  transports
} from 'winston';

import { CustomError } from '@src/error/errors';
import { LogFormat, LoggerConfig } from '@src/logger/types';

function convertErrorToObject(target: TransformableInfo) {
  const nestedErrorKeys = [];
  for (const [nestedKey, nestedValue] of Object.entries(target)) {
    if (nestedValue instanceof Error) {
      nestedErrorKeys.push(nestedKey);
    }
  }

  for (const nestedKey of nestedErrorKeys) {
    target[nestedKey] = Object.assign(
      {
        message: target[nestedKey].message,
        stack: target[nestedKey].stack
      },
      target[nestedKey]
    );
  }

  if (target instanceof CustomError) {
    // Object.assign() performs a deep copy for primitive types with depth 0
    target = Object.assign(
      {
        stack: target.stack
      },
      target
    );
    return target;
  } else {
    // Object.assign() performs a deep copy for primitive types with depth 0
    target = Object.assign(
      {
        message: target.message,
        stack: target.stack
      },
      target
    );
    return target;
  }
}

function convertErrorPropertiesToObject(target: TransformableInfo) {
  const errorKeys = [];
  for (const [key, value] of Object.entries(target)) {
    if (value instanceof Error) {
      errorKeys.push(key);
    }
  }

  if (errorKeys.length <= 0) return;

  for (const key of errorKeys) {
    const nestedErrorKeys = [];
    for (const [nestedKey, nestedValue] of Object.entries(target[key])) {
      if (nestedValue instanceof Error) {
        nestedErrorKeys.push(nestedKey);
      }
    }

    for (const nestedKey of nestedErrorKeys) {
      target[key][nestedKey] = Object.assign(
        {
          message: target[key][nestedKey].message,
          stack: target[key][nestedKey].stack
        },
        target[key][nestedKey]
      );
    }

    if (target[key] instanceof CustomError) {
      target[key] = Object.assign({ stack: target[key].stack }, target[key]);
    } else {
      target[key] = Object.assign(
        {
          message: target[key].message,
          stack: target[key].stack
        },
        target[key]
      );
    }
  }
}

const enumerateErrorFormat = format((info) => {
  // info
  if (info instanceof Error) {
    return convertErrorToObject(info);
  }

  // metadata
  convertErrorPropertiesToObject(info);
  return info;
});

// The available log levels are described in the link below.
// https://github.com/winstonjs/winston#logging-levels
export function initializeLogger(config: LoggerConfig): Logger {
  let loggerOption: LoggerOptions;
  try {
    if (config.format === LogFormat.JSON) {
      loggerOption = getJsonLoggerOption(config);
    } else {
      loggerOption = getTextLoggerOption(config);
    }
    return createLogger(loggerOption);
  } catch (e) {
    throw Error('failed to initialze logger');
  }
}

function getTextLoggerOption(config: LoggerConfig): LoggerOptions {
  return {
    level: config.level,
    defaultMeta: {
      deployment: config.deployment
    },
    format: format.combine(
      enumerateErrorFormat(),
      format.colorize(),
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.printf(({ level, message, timestamp, ...metadata }) => {
        let msg = `[${timestamp}][${level}]: ${message} `;
        if (metadata) {
          msg += JSON.stringify(metadata);
        }
        return msg;
      })
    ),
    transports: [new transports.Console()]
  };
}

function getJsonLoggerOption(config: LoggerConfig): LoggerOptions {
  return {
    level: config.level,
    defaultMeta: {
      deployment: config.deployment
    },
    format: format.combine(
      enumerateErrorFormat(),
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.json()
    ),
    transports: [new transports.Console()]
  };
}
