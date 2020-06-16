export interface ConversationsRepliesResponse {
  messages?: Message[];
  has_more?: boolean;
  ok?: boolean;
  response_metadata?: ResponseMetadata;
  error?: string;
  needed?: string;
  provided?: string;
}

export interface Message {
  type?: string;
  subtype?: string;
  text?: string;
  ts?: string;
  username?: string;
  bot_id?: string;
  thread_ts?: string;
  reply_count?: number;
  reply_users_count?: number;
  latest_reply?: string;
  reply_users?: string[];
  replies?: Reply[];
  subscribed?: boolean;
  user?: string;
  team?: string;
  bot_profile?: BotProfile;
  parent_user_id?: string;
}

export interface BotProfile {
  id?: string;
  deleted?: boolean;
  name?: string;
  updated?: number;
  app_id?: string;
  icons?: Icons;
  team_id?: string;
}

export interface Icons {
  image_36?: string;
  image_48?: string;
  image_72?: string;
}

export interface Reply {
  user?: string;
  ts?: string;
}

export interface ResponseMetadata {
  next_cursor?: string;
}