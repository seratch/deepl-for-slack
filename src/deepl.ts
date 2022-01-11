import { default as axios, AxiosInstance } from "axios";
import qs from "qs";
import { Logger } from "@slack/logger";
import {AssertionError} from "assert";

export class DeepLApi {
  private authKey: string;
  private axiosInstance: AxiosInstance;
  private logger: Logger;
  private readonly autoLang0: string;
  private readonly autoLang1: string;
  constructor(authKey: string, logger: Logger) {
    this.authKey = authKey;
    this.logger = logger;
    const usingFreePlan = process.env.DEEPL_FREE_API_PLAN === "1";
    const apiSubdomain = usingFreePlan ? 'api-free' : 'api';
    this.axiosInstance = axios.create({
      baseURL: `https://${apiSubdomain}.deepl.com/v2`,
      timeout: 30000,
    });
    const useAutoTranslate = process.env.SLACK_AUTO_TRANSLATE === "1";
    this.autoLang0 = "";
    this.autoLang1 = "";
    if (useAutoTranslate) {
      if (!process.env.SLACK_AUTO_TRANSLATE_LANG)
        throw "SLACK_AUTO_TRANSLATE_LANG not set";
      const languageList = process.env.SLACK_AUTO_TRANSLATE_LANG.split(',');
      if (languageList.length != 2) {
        throw "Auto translate needs exactly two languages";
      }
      this.autoLang0 = languageList[0].trim().toUpperCase();
      this.autoLang1 = languageList[1].trim().toUpperCase();
      this.logger.info(`Setting auto translation between ${this.autoLang0} and ${this.autoLang1}`);
      if (this.autoLang0 === "" || this.autoLang1 === "" || this.autoLang1 == this.autoLang0) {
        throw `Wrong auto-translate language setting. L0:${this.autoLang0} L1:${this.autoLang1}`;
      }
    }
  }

  async translate(text: string, targetLanguage: string): Promise<string | null> {
    return this.axiosInstance({
      url: "/translate",
      data: qs.stringify({
        auth_key: this.authKey,
        text: text,
        target_lang: targetLanguage.toUpperCase()
      }),
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=utf-8"
      }
    }).then(response => {
      this.logger.debug(response.data);
      if (response.data.translations && response.data.translations.length > 0) {
        return response.data.translations[0].text;
      } else {
        return ":x: Failed to translate it due to an unexpected response from DeepL API";
      }
    }).catch(error => {
      this.logger.error(`Failed to translate - text: ${text} error: ${error}`);
      return `:x: Failed to translate it due to ${error}`;
    });
  }

  private guessSourceTargetLang(text:string): [string, string] {
    let sourceLang = this.autoLang0;
    let targetLang = this.autoLang1;
    if (targetLang === "JA" || sourceLang === "JA") {
      const textContainsJA : boolean =
          text.match(/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/) !== null;
      if (textContainsJA && targetLang === "JA") {
        return [targetLang, sourceLang];
      }
    }
    return [sourceLang, targetLang];
  }

  async autoTranslate(text: string): Promise<string | null> {
    let [sourceLang, targetLang] = this.guessSourceTargetLang(text);
    return this.axiosInstance({
      url: "/translate",
      data: qs.stringify({
        auth_key: this.authKey,
        text: text,
        target_lang: targetLang
      }),
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=utf-8"
      }
    }).then(response => {
      this.logger.debug(response.data);
      if (response.data.translations && response.data.translations.length > 0) {
        if (response.data.translations[0].detected_source_language === sourceLang) {
          this.logger.debug(`Guessed right, text was in ${response.data.translations[0].detected_source_language}`);
          return response.data.translations[0].text;
        } else {
          this.logger.debug(`Guessed wrong, text was ${response.data.translations[0].detected_source_language} now translating to ${sourceLang}`);
          return this.translate(text, sourceLang);
        }
      } else {
        return ":x: Failed to translate it due to an unexpected response from DeepL API";
      }
    }).catch(error => {
      this.logger.error(`Failed to translate - text: ${text} error: ${error}`);
      return `:x: Failed to translate it due to ${error}`;
    });
  }
}