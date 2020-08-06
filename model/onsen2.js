const puppeteer = require('puppeteer');
const util = require('util');
const fs = require('fs');
const devices = require('puppeteer/DeviceDescriptors');
const device = devices['iPad Pro'];
const childProcess = require('child_process');
const exec = util.promisify(childProcess.exec);

const ONSEN_URL = "https://www.onsen.ag/";

module.exports = class Onsen {
  constructor(headless) {
    this.headless = true;
    if (headless === false) {
      this.headless = false;
    }
  }

  async init() {
    this.now = new Date();
    console.log(`Get radios at ${this.now.toISOString()}`);

    this.browser = await puppeteer.launch({
      headless: this.headless,
      args: ['--lang=ja,en-US,en']
    });
    this.page = await this.browser.newPage();
    await this.page.emulate(device);
    await this.page.goto(ONSEN_URL, {
      waitUntil: 'domcontentloaded'
    });
    console.log('wait...');
    await this.page.waitFor(1000);
    console.log('start!');
  }

  fileExists(filename) {
    try {
      fs.accessSync(filename);
      return true;
    } catch (e) {
      return false;
    }
  }

  async run() {
    let radios = await this.page.evaluate(() => {
      return [...window.__NUXT__.state.programs.programs.all]
        .map((e) => ({
          title: e.title, 
          contents: e.contents
                      .filter((e) => e.streaming_url != null)
                      .map((e) => ({ 
                        title: e.title.replace(/\//ig, '／'),
                        filename:e.streaming_url.split('/')[6], 
                        streaming_url: e.streaming_url 
                      }))
        }));
    });
    // youtube-dl でダウンロード
    await exec('mkdir output2').catch(e => {});
    for (let i = 0; i < radios.length; i++) {
      const radio = radios[i];
      for (let j = 0; j < radio.contents.length; j++) {
        const content = radio.contents[j];
        await exec(`mkdir "output2/${radio.title}"`).catch(e => {});
        if (this.fileExists(`output2/${radio.title}/${radio.title} ${content.title} ${content.filename}`)) {
          console.log(`Skip:       ${radio.title} ${content.title} ${content.streaming_url}`);
        } else {
          console.log(`Download:   ${radio.title} ${content.title} ${content.streaming_url}`);
          await exec(`youtube-dl --o '${radio.title} ${content.title} ${content.filename.split('.')[0]}.%(ext)s' ${content.streaming_url}`, {
            cwd: `output2/${radio.title.replace(/\"/ig, '')}`
          });  
        }
      }
    }
  }

  async close() {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}
