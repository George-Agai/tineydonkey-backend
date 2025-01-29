// In cron.js
const cron = require('node-cron');
const axios = require('axios');

function startCronJob() {
  const functionUrl = 'https://uninterested-antelope.onrender.com/get';
  // const functionUrl = 'http://192.168.0.104:3000/get';


  cron.schedule('*/5 * * * *', async() => {
    await axios.get(functionUrl)
      .then((response) => {
        console.log(`Warm-up request successful. Status: ${response.data.message}`);
      })
      .catch((error) => {
        console.error(`Warm-up request failed: ${error.message}`);
      });
  });

  console.log('Warm-up script started.');

  setInterval(() => {}, 1000);
}

module.exports = startCronJob;
