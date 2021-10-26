const { App } = require('@slack/bolt');
const axios = require('axios');
require('dotenv').config();

module.exports = () => {
  const app = new App({
    token: process.env.TOKEN,
    signingSecret: process.env.SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.APP_TOKEN
  });

  async function getJoke({ category, say }) {
    try {
      const { data } = await axios.get(
        `https://v2.jokeapi.dev/joke/${category}?safe-mode`
      );

      if (data.error) {
        await say(data.message);
        say(data.additionalInfo);
      } else if (data.type === 'single') {
        say(data.joke);
      } else {
        await say(data.setup);
        await new Promise(resolve => setTimeout(resolve, 1000));
        say(data.delivery);
      }
    } catch (error) {
      console.log('err');
      console.error(error);
    }
  }

  app.command('/joke', async ({ command, ack, say }) => {
    try {
      await ack();
      const category =
        !!command?.text && command?.text !== '' ? command?.text : 'Any';
      await getJoke({ category, say });
    } catch (error) {
      console.log('err');
      console.error(error);
    }
  });

  app.message(
    /^(?=.*?(hi|hello|hey|:wave|what's up|how's it going|help)).*$/gi,
    async ({ message, say }) => {
      try {
        say(
          `Hi <@${message.user}>! I'm funny. Ask me to tell a joke or type /joke`
        );
      } catch (error) {
        console.log('err');
        console.error(error);
      }
    }
  );

  app.message(/^(?=.*?(tell))(?=.*?(joke)).*$/gi, async ({ message, say }) => {
    let pattern = /(any|misc|programming|dark|pun|spooky|christmas)/gi;
    try {
      say('Ok!');
      const category = message.text.match(pattern)?.join(',') ?? 'Any';
      await getJoke({ category, say });
    } catch (error) {
      console.log('err');
      console.error(error);
    }
  });

  app.start(3000);
};
