const fs = require('fs');
const readline = require('readline');
const stream = require('stream');

module.exports = class History {
  constructor(filename) {
    this.filename = filename;
  }

  insertHistory(data) {
    try {
      fs.appendFileSync(this.filename, '\n' + data);
    } catch (error) {
      console.error(error);
    }
  }

  readLast() {
    let input = fs.createReadStream(this.filename);
    let output = new stream;

    return new Promise((resolve, reject) => {
      let rl = readline.createInterface(input, output);
      let lastline = '';
      rl.on('line', (line) => {
        if (line.length > 0 || line !== require('os'.EOL)) {
          lastline = line;
        }
      });
      rl.on('error', reject);
      rl.on('close', () => {
        resolve(lastline);
      });
    });
  }
}