import {
  WebClient,
  ConversationsListResponse,
  UsersConversationsResponse,
} from "@slack/web-api";

const filterUndefined = (c: string | undefined) => c !== undefined;
const castToString = (c: string | undefined) => c as string;

(async () => {
  const token = process.env.SLACK_BOT_TOKEN;
  const client = new WebClient(token);

  let channelIdsToJoin: string[] = [];

  console.log(`Fetching all the public channels ...`);
  for await (const response of client.paginate("conversations.list", {
    types: "public_channel",
    exclude_archived: true,
    limit: 1000,
  })) {
    const ids = (response as ConversationsListResponse).channels
      ?.map((c) => c.id)
      ?.filter(filterUndefined)
      ?.map(castToString);
    if (ids) {
      channelIdsToJoin.push(...ids);
    }
  }

  console.log(`Fetching the channels where this app is already in ...`);
  for await (const response of client.paginate("users.conversations", {
    types: "public_channel",
    exclude_archived: true,
    limit: 1000,
  })) {
    const ids = (response as UsersConversationsResponse).channels
      ?.map((c) => c.id)
      ?.filter(filterUndefined)
      ?.map(castToString);
    if (ids) {
      for (const id of ids) {
        const idx = channelIdsToJoin.indexOf(id);
        if (idx !== -1) {
          channelIdsToJoin.splice(idx, 1);
        }
      }
    }
  }
  if (channelIdsToJoin && channelIdsToJoin.length > 0) {
    console.log(`The public channels to join: ${channelIdsToJoin}`);
    console.log(`Joining all the channels ...`);
    for (const channel of channelIdsToJoin) {
      const response = await client.conversations.join({ channel });
      if (response.error) {
        console.log(`Failed to join a channel: ${JSON.stringify(response)}`);
        throw new Error(response.error);
      }
    }
  }
  console.log("Done!");
})();
