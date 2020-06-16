## DeepL App for Slack

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/seratch/deepl-for-slack/tree/master)

## Features

### Shortcut to run DeepL Translate API

Slack users can run DeepL Translate API in a modal.

<img src="https://user-images.githubusercontent.com/19658/84773721-cb505f80-b017-11ea-8c41-aed57012ab8b.gif" height="500">

### Post a translated text in thread

This works mostly the same as [reacjilator](https://github.com/slackapi/reacjilator).

<img src="https://user-images.githubusercontent.com/19658/84773773-dc996c00-b017-11ea-9022-017492a7c9df.gif" height="500">

## Prerequisites

To run this app, the following accounts are required.

* DeepL Pro (for Developers) account
* Slack workspace and user account
* Heroku account

If you already have all of them, setting up this app requires only 5 minutes.

## Set up

### Create your DeepL Pro (for Developers) account

* Select "for Developers" plan at https://www.deepl.com/pro/ (be careful not to choose any other)
* Go to your [DeepL Pro Account](https://www.deepl.com/pro-account.html) page
* Save the **Authentication Key for DeepL API** value

Refer to the following resources for more details:

* https://www.deepl.com/en/pro/
* https://www.deepl.com/docs-api/

### Create your Slack App (Step 1)

* Create a new Slack app [here](https://api.slack.com/apps?new_app=1)
  * **App Name**: "DeepL Translation"
  * **Development Slack Workspace**: Choose the workspace you use this app

* Go to **Features > OAuth & Permissions** in the left pane
  * Scroll down to **Scopes > Bot Token Scopes** section
  * Click **Add an OAuth Scope** button
  * Add `channels:history`, `chat:write`, `groups:history`, `reactions:read`

* Got to **Settings > Install App** in the left pane
  * Click **Install App to Workspace** button
  * Click **Allow** button in the OAuth confirmation page
  * Save the **Bot User OAuth Access Token** value (xoxb-***)

* Go to **Settings > Basic Information** in the left pane
  * Scroll down to **App Credentials** section
  * Click **Show** button in **Signing Secret** section
  * Save the **Signing Secret** value

### Deploy to Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/seratch/deepl-for-slack/tree/master)

* Confirm [your billing settings](https://dashboard.heroku.com/account/billing)
* Deploy this app with the following env variables
  * `SLACK_SIGNING_SECRET`: **Settings > Basic Information > App Credentials > Signing Secret** in the Slack app config page
  * `SLACK_BOT_TOKEN`: **Settings > Install App > Bot User OAuth Access Token** in the Slack app config page
  * `DEEPL_AUTH_KEY`: **Authentication Key for DeepL API** in the DeepL Pro account page
* You may need to change the "Dyno Type" to enable the app

### Slack App (Step 2)

* Go to **Features > Event Subscriptions** in the left pane
  * Turn on **Enable Events**
  * Set the Request URL to `https://{your app's Heroku domain}/slack/events`
  * Click **Subscribe to bot events**
  * Click **Add Bot User Event** button
  * Add `reaction_added` event
  * Click **Save Changes** button at the bottom for sure

* Go to **Features > Interactivity & Shortcuts** in the left pane
  * Turn on **Interactivity**
  * Set the Request URL to `https://{your app's Heroku domain}/slack/events`
  * Scroll down to **Shortcuts** section
  * Click **Create New Shortcut** button
  * Choose **Global** and clikc **Next** button
  * **Name**: "DeepL Translation"
  * **Short Description**: "Run DeepL Translate API"
  * Callback ID: "deepl-translation"
  * Click **Save Changes** button at the bottom for sure

* Got to **Settings > Install App** in the left pane
  * Click **Install App to Workspace** button
  * Click **Allow** button in the OAuth confirmation page

### Verify it works in Slack

* Go to your Slack workspace

* Run `/invite @deepl_translation` in a channel
* Post a message saying `In functional programming, a monad is a design pattern that allows structuring programs generically while automating away boilerplate code needed by the program logic. Monads achieve this by providing their own data type (a particular type for each type of monad), which represents a specific form of computation, along with one procedure to wrap values of any basic type within the monad (yielding a monadic value) and another to compose functions that output monadic values (called monadic functions).`
* Add a reaction `:flag-jp:` to the message
* Check a new message in its thread

* Click **⚡ (Shortcuts)** button
* Click **DeepL Translation**
* Enter a text and the language on the modal

### License 

The MIT License