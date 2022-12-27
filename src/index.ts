import { loadEnv } from "./dotenv";
loadEnv();

import { App } from "@slack/bolt";
import { ConsoleLogger, LogLevel } from "@slack/logger";
import * as middleware from "./custom-middleware";

import { DeepLApi } from "./deepl";
import * as runner from "./runnner";
import * as reacjilator from "./reacjilator";

const logLevel = (process.env.SLACK_LOG_LEVEL as LogLevel) || LogLevel.INFO;
const logger = new ConsoleLogger();
logger.setLevel(logLevel);

const deepLAuthKey = process.env.DEEPL_AUTH_KEY;
if (!deepLAuthKey) {
  throw "DEEPL_AUTH_KEY is missing!";
}
const deepL = new DeepLApi(deepLAuthKey, logger);

const app = new App({
  logLevel,
  logger,
  token: process.env.SLACK_BOT_TOKEN!!,
  signingSecret: process.env.SLACK_SIGNING_SECRET!!,
  deferInitialization: true,
});
middleware.enableAll(app);

// -----------------------------
// shortcut
// -----------------------------

app.shortcut("deepl-translation", async ({ ack, body, client }) => {
  await ack();
  await runner.openModal(client, body.trigger_id);
});

app.view("run-translation", async ({ ack, client, body }) => {
  const text = body.view.state.values.text.a.value!;
  const lang = body.view.state.values.lang.a.selected_option!.value;

  await ack({
    response_action: "update",
    view: runner.buildLoadingView(lang, text),
  });

  const translatedText: string | null = await deepL.translate(text, lang);

  await client.views.update({
    view_id: body.view.id,
    view: runner.buildResultView(
      lang,
      text,
      translatedText || ":x: Failed to translate it for some reason"
    ),
  });
});

app.view("new-runner", async ({ body, ack }) => {
  await ack({
    response_action: "update",
    view: runner.buildNewModal(body.view.private_metadata),
  });
});

// -----------------------------
// reacjilator
// -----------------------------

import { ReactionAddedEvent } from "./types/reaction-added";

app.event("reaction_added", async ({ body, client }) => {
  const event = body.event as ReactionAddedEvent;
  if (event.item["type"] !== "message") {
    return;
  }
  const channelId = event.item["channel"];
  const messageTs = event.item["ts"];
  if (!channelId || !messageTs) {
    return;
  }
  const lang = reacjilator.lang(event);
  if (!lang) {
    return;
  }

  const replies = await reacjilator.repliesInThread(
    client,
    channelId,
    messageTs
  );
  if (replies.messages && replies.messages.length > 0) {
    const message = replies.messages[0];
    if (message.text) {
      const translatedText = await deepL.translate(message.text, lang);
      if (translatedText == null) {
        return;
      }
      if (reacjilator.isAlreadyPosted(replies, translatedText)) {
        return;
      }
      await reacjilator.sayInThread(client, channelId, translatedText, message);
    }
  }
});

// -----------------------------
// starting the app
// -----------------------------

(async () => {
  try {
    await app.init();
    await app.start(Number(process.env.PORT) || 3000);
    console.log("⚡️ Bolt app is running!");
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();
