import { loadEnv } from './dotenv';
loadEnv();

import { App } from '@slack/bolt';
import { ConsoleLogger } from '@slack/logger';
import { LogLevel } from '@slack/logger';
import * as customMiddleware from './custom-middleware';
import { ConversationsRepliesResponse } from './types/conversations-replies';
import { ReactionAddedEvent } from './types/reaction-added';
import { DeepLApi } from './deepl';
import { reactionToLang, langToReaction } from './languages';
import * as runner from './runnner';

const logLevel = process.env.SLACK_LOG_LEVEL as LogLevel || LogLevel.INFO;
const logger = new ConsoleLogger();
logger.setLevel(logLevel);

const deepLAuthKey = process.env.DEEPL_AUTH_KEY;
if (!deepLAuthKey) {
  throw "DEEPL_AUTH_KEY is missing!";
}
const deepL = new DeepLApi(deepLAuthKey, logger);

const app = new App({
  logger,
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

customMiddleware.enableAll(app);

app.shortcut("deepl-translation", async ({ ack, body, client }) => {
  await ack();
  await runner.openModal(client, body.trigger_id);
});

app.view("run-translation", async ({ ack, client, body }) => {
  const text = body.view.state.values.text.a.value;
  const lang = body.view.state.values.lang.a.selected_option.value;
  await ack({
    response_action: "update",
    view: {
      "type": "modal",
      "title": {
        "type": "plain_text",
        "text": "DeepL API Runner :books:"
      },
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "plain_text",
            "text": `Translating the text into ${langToReaction[lang]} ...`
          }
        },
        {
          "type": "divider"
        },
        {
          "type": "section",
          "text": {
            "type": "plain_text",
            "text": text
          }
        }
      ]
    }
  });

  const translatedText: string | null = await deepL.translate(text, lang);
  const modification = await client.views.update({
    view_id: body.view.id,
    view: {
      "type": "modal",
      "callback_id": "new-runner",
      "title": {
        "type": "plain_text",
        "text": "DeepL API Runner :books:"
      },
      "submit": {
        "type": "plain_text",
        "text": "Try Another"
      },
      "private_metadata": lang,
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "plain_text",
            "text": `Here is the same text in ${langToReaction[lang]}`
          }
        },
        {
          "type": "divider"
        },
        {
          "type": "section",
          "text": {
            "type": "plain_text",
            "text": translatedText || "(Failed to translate it...)"
          }
        },
        {
          "type": "divider"
        },
        {
          "type": "section",
          "text": {
            "type": "plain_text",
            "text": text
          }
        }
      ]
    }
  });
  if (logger.getLevel() <= LogLevel.DEBUG) {
    logger.debug(`chat.postMessage: ${JSON.stringify(modification)}`)
  }
});

app.view("new-runner", async ({ body, ack }) => {
  await ack({
    response_action: "update",
    view: runner.buildNewModal(body.view.private_metadata)
  })
})

app.event("reaction_added", async ({ body, client, logger }) => {
  const event = body.event as ReactionAddedEvent;
  if (event.item['type'] !== 'message') {
    return;
  }
  const channelId = event.item['channel'];
  const messageTs = event.item['ts'];
  if (!channelId || !messageTs) {
    return;
  }
  const reaction = event.reaction;
  const lang: string = reactionToLang[reaction];
  if (!lang) {
    return;
  }

  const replies = await client.conversations.replies({
    channel: channelId, ts: messageTs, inclusive: true
  }) as ConversationsRepliesResponse;
  if (replies.messages) {
    const message = replies.messages[0];
    if (message.text) {
      // DeepL
      const translatedText: string | null = await deepL.translate(message.text, lang);
      if (translatedText == null) {
        return;
      }
      let alreadyPosted: boolean = false;
      for (const messageInThread of replies.messages) {
        if (!alreadyPosted && messageInThread.text && messageInThread.text === translatedText) {
          alreadyPosted = true;
          break;
        }
      }
      if (alreadyPosted) {
        return;
      }
      const postedMessage = await client.chat.postMessage({
        channel: channelId,
        text: translatedText,
        thread_ts: message.thread_ts ? message.thread_ts : message.ts
      });
      if (logger.getLevel() <= LogLevel.DEBUG) {
        logger.debug(`chat.postMessage: ${JSON.stringify(postedMessage)}`)
      }
    }
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();

