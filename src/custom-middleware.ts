import { App } from "@slack/bolt";

export function enableAll(app: App) {
  if (process.env.SLACK_REQUEST_LOG_ENABLED === "1") {
    app.use(async (args: any) => {
      const copiedArgs = JSON.parse(JSON.stringify(args));
      copiedArgs.context.botToken = 'xoxb-***';
      if (copiedArgs.context.userToken) {
        copiedArgs.context.userToken = 'xoxp-***';
      }
      copiedArgs.client = {};
      copiedArgs.logger = {};
      args.logger.debug(
        "Dumping request data for debugging...\n\n" +
        JSON.stringify(copiedArgs, null, 2) +
        "\n"
      );
      const result = await args.next();
      args.logger.debug("next() call completed");
      return result;
    });
  }
}