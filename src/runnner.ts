import { View } from '@slack/types';
import { WebClient } from '@slack/web-api';
import { Option } from '@slack/types';
import { langToReaction, langToName } from './languages';

const lanaguageOptions: Option[] = Object.keys(langToReaction).map(lang => {
  return {
    "text": {
      "type": "plain_text",
      "text": `${langToReaction[lang]} ${langToName[lang]}`
    },
    "value": lang
  }
});

export async function openModal(client: WebClient, triggerId: string) {
  await client.views.open({
    trigger_id: triggerId,
    view: buildNewModal("en")
  });
}

export function buildNewModal(lang: string): View {
  return {
    "type": "modal",
    "callback_id": "run-translation",
    "title": {
      "type": "plain_text",
      "text": "DeepL API Runner :books:"
    },
    "submit": {
      "type": "plain_text",
      "text": "Translate"
    },
    "blocks": [
      {
        "type": "input",
        "block_id": "text",
        "element": {
          "type": "plain_text_input",
          "action_id": "a",
          "multiline": true,
          "placeholder": {
            "type": "plain_text",
            "text": "Put the text to translate"
          }
        },
        "label": {
          "type": "plain_text",
          "text": "Text"
        }
      },
      {
        "type": "input",
        "block_id": "lang",
        "element": {
          "type": "static_select",
          "action_id": "a",
          "placeholder": {
            "type": "plain_text",
            "text": "Choose language"
          },
          "initial_option": {
            "text": {
              "type": "plain_text",
              "text": `${langToReaction[lang]} ${langToName[lang]}`
            },
            "value": lang
          },
          "options": lanaguageOptions
        },
        "label": {
          "type": "plain_text",
          "text": "Language",
          "emoji": true
        }
      }
    ]
  };
}

export function buildLoadingView(lang: string, text: string): View {
  return {
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
  };
}

export function buildResultView(lang: string, sourceText: string, translatedText: string): View {
  return {
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
          "text": translatedText
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "section",
        "text": {
          "type": "plain_text",
          "text": sourceText
        }
      }
    ]
  }
}