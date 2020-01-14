const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const device = devices['iPhone 7'];
const fs = require('fs');
const request = require('request');
const ONSEN_URL = "http://www.onsen.ag";
const History = require('./history');
const path = require('path');

module.exports = class Onsen {
  constructor(headless) {
    this.headless = true;
    if (headless === false) {
      this.headless = false;
    }
    this.history = new History(path.join(__dirname, '../history.dat'));
  }

  async init() {
    this.now = new Date();
    let lastHistory = await this.history.readLast();
    let splitArray = lastHistory.split(' ');
    if (splitArray.length > 1) {
      this.lastUpdated = new Date(splitArray[0]);
    } else {
      let limit = new Date(this.now.getTime());
      limit.setDate(limit.getDate() - 7);
      limit.setHours(0);
      limit.setMinutes(0);
      this.lastUpdated = limit;
    }
    console.log(`Get radios after ${this.lastUpdated}`);
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

  async run(since) {
    let limit = this.lastUpdated;
    let radios = [];
    let week1_radios = await this.evaluate('#week_1'); // 月
    radios = radios.concat(week1_radios);
    let week2_radios = await this.evaluate('#week_2'); // 火
    radios = radios.concat(week2_radios);
    let week3_radios = await this.evaluate('#week_3'); // 水
    radios = radios.concat(week3_radios);
    let week4_radios = await this.evaluate('#week_4'); // 木
    radios = radios.concat(week4_radios);
    let week5_radios = await this.evaluate('#week_5'); // 金
    radios = radios.concat(week5_radios);
    let week6_radios = await this.evaluate('#week_6'); // 土・日
    radios = radios.concat(week6_radios);
    radios = await radios
      .filter((radio) => radio.url)
      .filter((radio) => radio.update)
      .map((radio) => {
        radio.update = radio.update.replace(' UP', '');
        return radio;
      })
      .map((radio) => {
        let update = new Date('2020/' + radio.update);
        if (this.now.getTime() < update.getTime()) {
          update = new Date('2019/' + radio.update);
        }
        radio.update = update;
        return radio;
      })
      .filter((radio) => {
        let update = radio.update;
        return update.getTime() > limit.getTime();
      })
      .map((radio) => {
        radio.group = radio.title.replace(/\//,'／').replace(/(.*) #(.*)/, '$1');
        return radio;
      });
//      .filter((radio) => radio.title.includes("Fate/stay night"));

    console.log('radios.length = ' + radios.length);

    for (var i = 0; i < radios.length; i++) {
      let radio = radios[i];
      this.history.insertHistory(`${radio.update.toISOString()} ${radio.title} ${radio.url}`);
      // continue;
      let dir = 'output/' + radio.group + '/';
      fs.mkdirSync(dir, { recursive: true });
      if (await this.isExists(dir + radio.title.replace(/\//,'／') + '.' + radio.url.split('.').pop())) {
        console.log(`Exists:   ${radio.update.toLocaleString()} ${radio.title} ${radio.url}`);
        continue;
      }
      console.log(`Download: ${radio.update.toLocaleString()} ${radio.title} ${radio.url}`);
      let response = await this.download(radio.url);
      response.pipe(await fs.createWriteStream(dir + radio.title.replace(/\//,'／') + '.' + radio.url.split('.').pop()));
    }
  }

  isExists(path) {
    return new Promise((resolve, reject) => {
      fs.access(path, fs.F_OK, (error) => {
        resolve(!error);
      });
    });
  }

  download(url, filename) {
    return new Promise(function(resolve, reject) {
      request.get(url)
        .on('error', (err) => console.error(err))
        .on('response', function(response) {
          response.pause();
          resolve(response);
        });
    });
  }

  // private
  async evaluate(query) {
    return await this.page.evaluate((query) => {
      return [...document.querySelectorAll(query + ' > div > div')]
        .map((e) => {
          return {
            title: e.querySelector('.programTitle').innerText,
            url: e.querySelector('.playBtn > form') ? e.querySelector('.playBtn > form').action : undefined,
            update: e.querySelector('.update').innerText,
            personality: e.querySelector('.programPersonality').innerText
          }
        });
    }, query);
  }

  async screenshot() {
    await this.page.screenshot({
      path: 'screenshot.png',
      fullPage: true
    });
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
