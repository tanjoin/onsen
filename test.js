const History = require('./model/history');
const path = require('path');

async function main() {
  const history = new History(path.join(__dirname, './history.dat'));
  try {
    let last = await history.readLast();
    console.log('last :');
    console.log(last);
    console.log('\n');
    history.insertHistory("2019/06/30 2:41 ほげほげ");
  } finally {
  }
}

// -- main --

if (typeof require != 'undefined' && require.main==module) {
    main();
}
