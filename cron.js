const CronJob = require('cron').CronJob;
const Onsen = require('./model/onsen2');

new CronJob('00 10 * * *', async () => {
  const onsen = new Onsen();
  try {
    await onsen.init().catch(e => console.error(e));
    await onsen.run().catch(e => console.error(e));
  } finally {
    await onsen.close().catch(e => console.error(e));
  }
}, null, true, 'Asia/Tokyo');