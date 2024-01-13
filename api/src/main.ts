import { ComponentHandler } from '@src/component/component.handler';

async function main() {
  const componentHandler = new ComponentHandler();
  await componentHandler.initialize();
  componentHandler.installShutdownSignalHandler();
}

if (require.main === module) {
  main();
}
