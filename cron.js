const CronJob = require('cron').CronJob;
const Onsen = require('./model/onsen');

new CronJob('00 10 * * 0', async () => {
  const onsen = new Onsen();
  try {
    await onsen.init();
    await onsen.run();
  } finally {
    await onsen.close();
  }
}, null, true, 'Asia/Tokyo');