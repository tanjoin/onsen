const Onsen = require('./model/onsen');

async function main() {
  const onsen = new Onsen(true, '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome');
  try {
    await onsen.init();
    await onsen.run();
    // await onsen.screenshot();
    console.log('finish!');
  } finally {
    await onsen.close();
  }
}

// -- main --

if (typeof require != 'undefined' && require.main == module) {
    main();
}
