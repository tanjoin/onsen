const Onsen = require('./model/onsen2');

async function main() {
  const onsen = new Onsen();
  try {
    await onsen.init().catch(e => console.error(e));
    await onsen.run().catch(e => console.error(e));
    // await onsen.screenshot();
  } finally {
    await onsen.close().catch(e => console.error(e));
  }
}

// -- main --

if (typeof require != 'undefined' && require.main==module) {
    main();
}
