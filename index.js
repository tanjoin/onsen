const Onsen = require('./model/onsen');

async function main() {
  const onsen = new Onsen();
  try {
    await onsen.init();
    await onsen.run();
    // await onsen.screenshot();
  } finally {
    await onsen.close();
  }
}

// -- main --

if (typeof require != 'undefined' && require.main==module) {
    main();
}
