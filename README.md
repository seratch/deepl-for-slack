## DeepL App for Slack

DeepL for Slack is a Slack integration that enables end-users to translate channel messages into a different lanuage just by adding reaction emoji.

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

### Create your Slack App

Use the [App Manifest file](https://github.com/seratch/deepl-for-slack/blob/master/app-manifest.yml) to configure a new app!

<img width="400" src="https://user-images.githubusercontent.com/19658/121115984-cef47c00-c850-11eb-9d7e-dbd80407ac9a.png">
<img width="400" src="https://user-images.githubusercontent.com/19658/121115976-cc922200-c850-11eb-8e23-1054c48b54d0.png">
<img width="400" src="https://user-images.githubusercontent.com/19658/121115986-cf8d1280-c850-11eb-8f7f-9d59112df42b.png">
<img width="400" src="https://user-images.githubusercontent.com/19658/121115989-d025a900-c850-11eb-9cb7-35fc979a81f8.png">

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
  * `DEEPL_FREE_API_PLAN`: Set to "1" if you are using the DeepL API Free Plan (the default is "0" for Pro Plan)
* You may need to change the "Dyno Type" to enable the app

### Slack App (Step 2)

* Go to **Features > Event Subscriptions** in the left pane
  * Set the Request URL to `https://{your app's Heroku domain}/slack/events`
  * Click **Save Changes** button at the bottom for sure

* Go to **Features > Interactivity & Shortcuts** in the left pane
  * Set the Request URL to `https://{your app's Heroku domain}/slack/events`
  * Click **Save Changes** button at the bottom for sure

### Verify it works in Slack

* Go to your Slack workspace

* Run `/invite @deepl_translation` in a channel
* Post a message saying `In functional programming, a monad is a design pattern that allows structuring programs generically while automating away boilerplate code needed by the program logic. Monads achieve this by providing their own data type (a particular type for each type of monad), which represents a specific form of computation, along with one procedure to wrap values of any basic type within the monad (yielding a monadic value) and another to compose functions that output monadic values (called monadic functions).`
* Add a reaction `:flag-jp:` to the message
* Check a new message in its thread

* Click **⚡ (Shortcuts)** button
* Click **Open DeepL Tool**
* Enter a text and the language on the modal

### License 

The MIT License

### Related Projects

If you are looking for more functionalities, take a look at the following awesome projects:

* https://github.com/monstar-lab-oss/deepl-for-slack-elixir
