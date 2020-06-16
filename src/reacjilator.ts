import { ConversationsRepliesResponse, Message } from './types/conversations-replies';
import { ReactionAddedEvent } from './types/reaction-added';
import { reactionToLang } from './languages';
import { WebClient } from '@slack/web-api';

export async function repliesInThread(client: WebClient, channel: string, ts: string): Promise<ConversationsRepliesResponse> {
  return await client.conversations.replies({
    channel,
    ts,
    inclusive: true
  }) as ConversationsRepliesResponse;
}

export function isAlreadyPosted(replies: ConversationsRepliesResponse, translatedText: string): boolean {
  if (!replies.messages) {
    return false;
  }
  for (const messageInThread of replies.messages) {
    if (messageInThread.text && messageInThread.text === translatedText) {
      return true;
    }
  }
  return false;
}

export function lang(event: ReactionAddedEvent): string | null {
  return reactionToLang[event.reaction];
}

export async function sayInThread(client: WebClient, channel: string, text: string, message: Message) {
  return await client.chat.postMessage({
    channel,
    text,
    thread_ts: message.thread_ts ? message.thread_ts : message.ts
  });
}