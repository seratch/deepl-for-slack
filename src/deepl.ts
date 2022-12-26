import { default as axios, AxiosInstance } from "axios";
import qs from "qs";
import { Logger } from "@slack/logger";

export class DeepLApi {
  private authKey: string;
  private axiosInstance: AxiosInstance;
  private logger: Logger;
  constructor(authKey: string, logger: Logger) {
    this.authKey = authKey;
    this.logger = logger;
    const usingFreePlan = process.env.DEEPL_FREE_API_PLAN === "1";
    const apiSubdomain = usingFreePlan ? 'api-free' : 'api';
    this.axiosInstance = axios.create({
      baseURL: `https://${apiSubdomain}.deepl.com/v2`,
      timeout: 30000,
    });
  }

  async translate(text: string, targetLanguage: string): Promise<string | null> {
    return this.axiosInstance({
      url: "/translate",
      data: qs.stringify({
        auth_key: this.authKey,

        // match special parsing
        text: text.replace(/<(.*?)>/g, function(i: any, match: string) {

          // match #channels and @mentions
          if(match.match(/^[#@].*$/)) {
            const matched = match.match(/^([#@].*)$/);
            if (matched != null) {
              return '<mkdwn>' + matched[1] + '</mkdwn>';
            }
            return '';
          }

          // match subteam
          if(match.match(/^!subteam.*$/)) {
            return '@[subteam mention removed]';
          }

          // match date formatting
          if(match.match(/^!date.*$/)) {
            const matched = match.match(/^(!date.*)$/);
            if (matched != null) {
              return '<mkdwn>' + matched[1] + '</mkdwn>';
            }
            return '';
          }

          // match special mention
          if(match.match(/^!.*$/)) {
            const matched = match.match(/^!(.*?)(?:\|.*)?$/);
            if (matched != null) {
              return '<ignore>@' + matched[1] + '</ignore>';
            }
            return '<ignore>@[special mention]</ignore>';
          }

          // match formatted link
          if(match.match(/^.*?\|.*$/)) {
            const matched = match.match(/^(.*?)\|(.*)$/);
            if (matched != null) {
              return '<a href="' + matched[1] + '">' + matched[2] + '</a>';
            }
            return '';
          }

          // fallback (raw link or unforeseen formatting)
          return '<mkdwn>' + match + '</mkdwn>';

        // match emoji
        }).replace(/:([a-z0-9_-]+):/g, function(i: any, match: string) {
          return '<emoji>' + match + '</emoji>';
        }),
        target_lang: targetLanguage.toUpperCase(),
        tag_handling: 'xml',
        ignore_tags: 'emoji,mkdwn,ignore'
      }),
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=utf-8"
      }
    }).then(response => {
      this.logger.debug(response.data);
      if (response.data.translations && response.data.translations.length > 0) {

        // match emoji
        return response.data.translations[0].text.replace(/<emoji>([a-z0-9_-]+)<\/emoji>/g, function(i: any, match: string) {
          return ':' + match + ':';

        // match <mkdwn>...</mkdwn>
        }).replace(/<mkdwn>(.*?)<\/mkdwn>/g, function(i: any, match: string) {
          return '<' + match + '>';

        // match <a href="...">...</a>
        }).replace(/(<a href="(?:.*?)">(?:.*?)<\/a>)/g, function(i: any, match: string) {
          const matched = match.match(/<a href="(.*?)">(.*?)<\/a>/);
          if (matched != null) {
            return '<' + matched[1] + '|' + matched[2] + '>';
          }
          return '';

        // match <ignore>...</ignore>
        }).replace(/<ignore>(.*?)<\/ignore>/g, function(i: any, match: string) {
          return match;
        });
      } else {
        return ":x: Failed to translate it due to an unexpected response from DeepL API";
      }
    }).catch(error => {
      this.logger.error(`Failed to translate - text: ${text} error: ${error}`);
      return `:x: Failed to translate it due to ${error}`;
    });
  }
}