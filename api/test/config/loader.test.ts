import config from 'config';

import {
  buildHttpConfig,
  buildLoggerConfig,
  loadConfig
} from '@src/config/loader';

describe('Test config loader', () => {
  it('should load valid configurations from a test.yaml', () => {
    expect(loadConfig()).toStrictEqual({
      env: 'test',
      timeout: { shutdownSeconds: 30 },
      http: { host: '127.0.0.1', port: 0 },
      logger: { level: 'silly', format: 'text' }
    });
  });

  it('should not override fields by env variable', () => {
    process.env.env = 'production';
    const config = loadConfig();
    expect(config.env).not.toEqual('production');
  });

  it('should throw error when config.get() throw error', () => {
    jest.spyOn(config, 'get').mockImplementationOnce(() => {
      throw new Error('');
    });
    expect(() => {
      loadConfig();
    }).toThrow();
  });
});

describe('Test build logger config', () => {
  it('should build valid logger config from a test.yaml', () => {
    expect(buildLoggerConfig(loadConfig())).toStrictEqual({
      deployment: 'test',
      level: 'silly',
      format: 'text'
    });
  });
});

describe('Test build http config', () => {
  it('should build valid http config from a test.yaml', () => {
    expect(buildHttpConfig(loadConfig())).toStrictEqual({
      env: 'test',
      host: '127.0.0.1',
      port: 0
    });
  });
});
