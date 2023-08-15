import {
  buildHttpConfig,
  buildLoggerConfig,
  loadConfig
} from '@src/config/loader';
import { initializeLogger } from '@src/logger/logger';

import { HttpServer } from '@controller/http/server';

async function main() {
  let config;
  try {
    config = loadConfig();
  } catch (e) {
    console.error(`${e}`);
    process.exit(1);
  }

  const logger = initializeLogger(buildLoggerConfig(config));
  const httpServer = new HttpServer(logger, buildHttpConfig(config));
  await httpServer.start();
  // await httpServer.close();
  // logger.info('Server shutdowned');
}

if (require.main === module) {
  main();
}
