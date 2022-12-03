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
        text: text.replace(/<(.*?)>/g, function(i: any, match: string) {
          if(match.match(/^!subteam/)) {
            return '';
          }
          if(match.match(/^!/)) {
            const matched = match.match(/^!([a-z]+)$/);
            if (matched != null) {
              return '<ignore>@' + matched[1] + '</ignore>';
            }
            return '';
          }
          if(match.match(/^.*?\|.*$/)) {
            const matched = match.match(/^(.*?)\|(.*)$/);
            if (matched != null) {
              return '<a href="' + matched[1] + '">' + matched[2] + '</a>';
            }
            return '';
          } else {
            return '<url>' + match + '</url>';
          }
        }).replace(/:([a-z0-9_-]+):/g, function(i: any, match: string) {
           return '<emoji>' + match + '</emoji>';
        }),
        target_lang: targetLanguage.toUpperCase(),
        tag_handling: 'xml',
        ignore_tags: 'emoji,url,ignore'
      }),
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=utf-8"
      }
    }).then(response => {
      this.logger.debug(response.data);
      if (response.data.translations && response.data.translations.length > 0) {
        return response.data.translations[0].text.replace(/<emoji>(.*?)<\/emoji>/g, function(i: any, match: string) {
          return ':' + match + ':';
        }).replace(/<url>(.*?)<\/url>/g, function(i: any, match: string) {
          return '<' + match + '>';
        }).replace(/(<a href="(?:.*?)">(?:.*?)<\/a>)/g, function(i: any, match: string) {
          const matched = match.match(/<a href="(.*?)">(.*?)<\/a>/);
          if (matched != null) {
            return '<' + matched[1] + '|' + matched[2] + '>';
          }
          return '';
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