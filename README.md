# Telnyx Answering Machine Detection Demo
Telnyx Aswering Machine Detection (AMD) demo built on Call Control and node.js.


In this tutorial, you’ll learn how to:

1. Set up your development environment to use Telnyx Call Control using Node.
2. Build an AMD based app on Telnyx Call Control using Node.


---

- [Prerequisites](#prerequisites)
- [Telnyx Call Control Basics](#telnyx-call-control-basics)
  - [Understanding the Command Syntax](#understanding-the-command-syntax)
  - [Telnyx Call Control Commands](#telnyx-call-control-commands)
- [Building Answering Machine Detection Demo](#building-find-me-follow-me-ivr)
- [Lightning-Up the Application](#lightning-up-the-application)


---

## Prerequisites

Before you get started, you’ll need to complete these steps:

1. Have a Telnyx account, that you can create [here](https://telnyx.com/sign-up) 
2. Buy a Telnyx number on Mission Portal, that you can learn how to do [here](https://developers.telnyx.com/docs/v2/numbers/quickstarts/portal-setup)
3. Create a new Connection as Call Control on Mission Portal, that you can learn how to do [here](https://developers.telnyx.com/docs/v2/call-control/quickstart).
4. You’ll need to have `node` installed to continue. You can check this by running the following:

```shell
$ node -v
```

If Node isn’t installed, follow the [official installation instructions](https://nodejs.org/en/download/) for your operating system to install it.

You’ll need to have the following Node dependencies installed for the Call Control API:

```js
require(express);
require(request);
```

## Telnyx Call Control Basics

For the Call Control application you’ll need to get a set of basic functions to perform Telnyx Call Control Commands. This tutorial will be using the following subset of Telnyx Call Control Commands:


- [Call Control Dial](https://developers.telnyx.com/docs/api/v2/call-control/Call-Commands#CallControlDial)
- [Call Control Speak Text](https://developers.telnyx.com/docs/api/v2/call-control/Call-Commands#CallControlSpeak)


You can get the full set of available Telnyx Call Control Commands [here](https://developers.telnyx.com/docs/api/v2/call-control).

For each Telnyx Call Control Command we will be creating a function that will execute an `HTTP POST` Request to back to Telnyx server.  To execute this API we are using Node `request`, so make sure you have it installed. If not you can install it with the following command:

```shell
$ npm install request --save
```

After that you’ll be able to use ‘request’ as part of your app code as follows:

```js
var request = require('request');
```

To make use of the Telnyx Call Control Command API you’ll need to set a Telnyx API Key and Secret. 

To check that go to Mission Control Portal and under the `Auth` tab you select `Auth V2`.

Once you have them, you can include it as ‘const’ variable in your code:

```js
const telnyx_auth = require("./telnyx-config");
const g_telnyx_api_auth_v2 = telnyx_auth.api;
```

We have a number of secure credentials to work with we created an additional file `telnyx-config` to store this information. Here we will store our API Key as well as our connection ID, the DID associated with that connection and the PSTN DID we will send calls to.

```js
const telnyx_config = {
    //  Telnyx API Key
    api: "YOUAPIKEY",
    // Telnnyx Connection ID that will initiate Calls
    connection_id: "1381752105912532",
    // From DID
    telnyx_did: "+11234567890",
    // Parent's Phone Number
    target_number: "+11234567890"

};

module.exports = telnyx_config;

module.exports = telnyx_config;


```
Once all dependencies are set, we can create a function for each Telnyx Call Control Command. All Commands will follow the same syntax:

```js

const call_control_COMMAND_NAME = (f_call_control_id, f_INPUT1, ...) => {
	
	var l_cc_action = ‘COMMAND_NAME’

	var options = {
		url: `https://api.telnyx.com/v2/calls/${f_call_control_id}/actions/${l_cc_action}`,
		headers: f_post_headers,
		json: {
			call_control_id: f_call_control_id
		}
	};

	request.post(options, function(err, resp, body) {
		if (err) {
			return console.log(err);
		}
	
	});
}
```
We are saving some space by storing our post headers in a varible and passing them as a parameter in the function as they do not change
```js
const g_post_headers = {
	"Content-Type": "application/json",
	Accept: "application/json",
	Authorization: `Bearer ${g_telnyx_api_auth_v2}`
};

```

### Understanding the Command Syntax

There are several aspects of this function that deserve some attention:

`Function Input Parameters`: to execute every Telnyx Call Control Command you’ll need to feed your function with the following: the `Call Control ID`; and the input parameters, specific to the body of the Command you’re executing. Having these set as function input parameters will make it generic enough to reuse in different use cases:
```js
const call_control_COMMAND_NAME = (f_call_control_id, f_INPUT1, ...)
```
All Telnyx Call Control Commands will be expecting the `Call Control ID` except `Dial`. There you’ll get a new one for the leg generated as response.

`Name of the Call Control Command`: as detailed [here](https://developers.telnyx.com/docs/api/v2/call-control/), the Command name is part of the API URL. In our code we call that the `action` name, and will feed the POST Request URL later:
```js
var cc_action = ‘COMMAND_NAME’
```

`Building the Telnyx Call Control Command`: once you have the Command name defined, you should have all the necessary info to build the complete Telnyx Call Control Command:
```js
var options = {
    url: `https://api.telnyx.com/v2/calls/${f_call_control_id}/actions/${l_cc_action}`,
    headers: f_post_headers,
    json: {
        call_control_id: f_call_control_id
    }
};
```
In this example you can see that `Call Control ID` and the Action name will feed the URL of the API, both Telnyx Key and Telnyx Secret feed the Authentication headers, and the body will be formed with all the different input parameters  received for that specific Command. 


`Calling the Telnyx Call Control Command`: Having the request  `headers` and `options`/`body` set, the only thing left is to execute the `POST Request` to execute the command. 
For that we are using making use of the node's `request` module:
```js
 request.post(options,function(err,resp,body){
    if (err) { return console.log(err); }
});  
```

### Telnyx Call Control Commands

This is how every Telnyx Call Control Command used in this application would look like:

#### Call Control Speak


```js
const call_control_speak = (
	f_post_headers,
	f_call_control_id,
	f_tts_text,
	f_client_state_s
) => {
	console.log(`[%s] LOG - SPEAK! ${get_timestamp()}`);

	var l_cc_action = "speak";
	if (f_client_state_s)
		l_client_state_64 = Buffer.from(f_client_state_s).toString("base64");

	var options = {
		url: `https://api.telnyx.com/v2/calls/${f_call_control_id}/actions/${l_cc_action}`,
		headers: f_post_headers,
		json: {
			payload: f_tts_text,
			voice: g_ivr_voice,
			language: g_ivr_language,
			client_state: l_client_state_64
		}
	};

	request.post(options, function(err, resp, body) {
		if (err) {
			return console.error(err);
		}
		console.log(`[%s] DEBUG - Command Executed [%s] ${get_timestamp()} | ${l_cc_action}
		`);
		console.log(body);
	});
};
```

#### Call Control Hangup

```js
const call_control_hangup = (f_post_headers, f_call_control_id) => {
	console.log(`[%s] LOG - Hangup!" ${get_timestamp()}`);

	var l_cc_action = "hangup";

	var options = {
		url: `https://api.telnyx.com/v2/calls/${f_call_control_id}/actions/${l_cc_action}`,
		headers: f_post_headers,
		json: {}
	};

	request.post(options, function(err, resp, body) {
		if (err) {
			return console.error(err);
		}
		console.log(`[%s] DEBUG - Command Executed [%s] ${get_timestamp()} | ${l_cc_action}
		`);
		console.log(body);
	});
};

```
#### Call Control Dial

```js
const call_control_dial = (
	f_post_headers,
	f_connection_id,
	f_dest,
	f_orig,
	f_client_state_s
) => {
	console.log(`[%s] LOG - DIAL! ${get_timestamp()}`);
	var l_cc_action = "dial";

	var l_client_state_64 = null;

	if (f_client_state_s)
		l_client_state_64 = Buffer.from(f_client_state_s).toString("base64");

	var options = {
		url: `https://api.telnyx.com/v2/calls/`,
		headers: f_post_headers,
		json: {
			connection_id: f_connection_id,
			to: f_dest,
			from: f_orig,
			answering_machine_detection: f_amd
		}
	};

	request.post(options, function(err, resp, body) {
		if (err) {
			return console.error(err);
		}
		console.log(`[%s] DEBUG - Command Executed [%s] ${get_timestamp()} | ${l_cc_action}
		`);
		console.log(body);
	});
};
```
#### Answering Machine Detection
It is important to further explain how AMD works. The key to ensure we can determine if we reached a human or a machine is by providing Answering Machine Detection configuration of `detect_words` in our Dial Command. Detect Words takes a lot of configuration and guesswork out of this function. It works algorithmically by interpreting the number of words recited by the callee when the call is answered. When a call is answered, the message still plays regardless if we reach a machine or human as fail safe. Telnyx is monitoring the media stream of the callee. If we detect that more than 5 words from the callee, it is safe to assume we have reached a machine. AMD kicks in and the message stops playing. Telnyx then begins listening for the voicemail beep. When we receive the beep, we play the message from the begining and leave the full message in the voicemail box.




## Building Answering Machine Detection Demo


With all the basic Telnyx Call Control Commands set, we are ready to consume them and put them in the order that will create the desired Outcome. This tutorial is setup to mock a voice notification which plays a pre-configured greeting when is answered, but is also powered with Answering Machine Detection so that the full message is left in the event we do not reach our target directly. This example can be easily iterated for mass voice notifications

1. Initiate Outbound Calls
2. Utilize Answering Machine Detection to detect a human or machine
3. Play a pre-determined greeting
4. If reached machine, hangup and end call.



To exemplify this process we created a simple API call that will be exposed as the webhook in Mission Portal. For that we would be using `express`:

```shell
$ npm install request --save
```

With `express` we can create an API wrapper that uses `HTTP GET` to call our Request Token method:

```js

rest.post(`/${g_appName}`, (req, res) => {
  // APP CODE GOES HERE  
})
```

This would expose a webhook like the following: 

    http://MY_DOMAIN_URL/telnyx-amd

You probably noticed that `g_appName` in  the previous point. That is part of a set of global variables we are defining with a certain set of info we know we are going to use in this app: TTS parameters, like voice and language to be used and IVR redirecting contact points. 

You can set these at the beginning of your code:

```js
// Application:
const g_appName = "telnyx-amd";

// TTS Options
const g_ivr_voice = "female";
const g_ivr_language = "en-US";

```

With that set, we can fill in that space that we named as `APP CODE GOES HERE`. So as you expose the URL created as Webhook in Mission Control associated with your number, you’ll start receiving all call events for that call. 

So the first thing to be done is to identify the kind of event you just received and extract the `Call Control Id` and `Client State` (if defined previously):

```js
if (req && req.body && req.body.event_type){
   	if (req && req.body && req.body.data.event_type) {
		var l_hook_event_type = req.body.data.event_type;
		var l_call_control_id = req.body.data.payload.call_control_id;
		var l_client_state_64 = req.body.data.payload.client_state;
		
} else{res.end('0');}
```

Once you identify the `Event Type` and `Call State` received, it’s just a matter of having your application reacting to that. Is the way you react to that Event that helps you creating the IVR logic. What you would be doing is to execute Telnyx Call Control Command as a reaction to those Events.



### `Command Dial`
As the pourpose of this demo is to place an outbound call to a target and play a message for them if they answer, or leave the message. 

```js

else if (l_hook_event_type == "call.answered") {

call_control_dial(
	g_post_headers,
	g_connection_id,
	g_target_did,
	g_call_control_did,
    "stage-dial",
    "detect_words
);
res.end();

```


### `Webhook Dial Answered >> Command  Speak`

After we initiate the `Dial` Command, we will recieve a hook back from Telnyx with the all important Call Control ID. In this demo we issue call_control_speak at two different hook events. The only paramater that changes is the `client_state`. We will use the change to client state to allow us to issue a `hangup` when voicemail is left, but we will not issue a hangup if a live person answers.

```js
else if (l_hook_event_type == "call.answered") {

call_control_speak(
    g_post_headers,
    l_call_control_id,
    `This is a message from Don Corleone, Luca Brasi sleeps with the fishes`,
    "Target-Answer"
);

res.end();


}

```
`Client State`: within some of the Telnyx Call Control Commands list we presented, you probably noticed we were including the `Client State` parameter. `Client State` is the key to ensure that we can perform functions only when very specific conditions are met on our App while consuming the same Call Control Events. 

Because Call Control is stateless and async your application will be receiving several events of the same type, e.g. user just included `DTMF`. With `Client State` you enforce a unique ID to be sent back to Telnyx which be used within a particular Command flow and identifying it as being at a specific place in the call flow. We will utilize Client State in this app to determine if a call reached the Target, or their Voicemail Box



*Important Note: For consistency Telnyx Call Control engine requires every single Webhook to be replied by the Webhook end-point, otherwise will keep trying. For that reason we have to be ready to consume every Webhook we expect to receive and reply with `200 OK`.*

### `Webhook Listen for AMD Hook to execute Speak when Beep Detected`
We need to be listening for `call.machine.greeting.ended`in order to execute the speak command after we've received a beep from the voicemail.


```js
else if (l_hook_event_type == "call.machine.greeting.ended") {
	

    call_control_speak(
        g_post_headers,
        l_call_control_id,
        `This is a message from Don Corleone`,
        "Left-Message"
    );

    res.end();
```

## Lightning-Up the Application
Finally the last piece of the puzzle is having your application listening for Telnyx Webhooks:

```js
const PORT = 8081;
rest.listen(PORT, () => {
	console.log(
		`SERVER ${get_timestamp()} -  app listening at http://localhost:${PORT}/${g_appName}`
	);
});

})
```

And start the application by executing the following command:

```shell
$ npm run dev
```

##  What's going on in the log?- When a message is left

```
[%s] LOG - DIAL! utc|2020/2/4|13:3:37:985
SERVER utc|2020/2/4|13:3:37:992 -  app listening at http://localhost:8081/telnyx-amd
[%s] DEBUG - Command Executed [%s] utc|2020/2/4|13:3:38:351 | dial

{
  data: {
    call_control_id: null,
    call_leg_id: '1234abcd-1010-01aa-001b-1234abcd678',
    call_session_id: '4765qqtr-1234-0043-4783-0101rtebw2',
    is_alive: false,
    record_type: 'call'
  }
}
[%s] LOG - Webhook received - event_type [%s] utc|2020/2/4|13:3:38:488 | call.initiated
[%s] LOG - Webhook received - event_type [%s] utc|2020/2/4|13:3:44:453 | call.answered
[%s] LOG - SPEAK! utc|2020/2/4|13:3:44:453
[%s] DEBUG - Command Executed [%s] utc|2020/2/4|13:3:44:724 | speak

{ data: { result: 'ok' } }
[%s] LOG - Webhook received - event_type [%s] utc|2020/2/4|13:3:45:200 | call.speak.started
[%s] LOG - Webhook received - event_type [%s] utc|2020/2/4|13:3:47:406 | call.machine.detection.ended
[%s] LOG - Webhook received - amd result [%s] utc|2020/2/4|13:3:47:406 | machine
[%s] LOG - Webhook received - event_type [%s] utc|2020/2/4|13:3:47:541 | call.speak.ended
[%s] LOG - Webhook received - event_type [%s] utc|2020/2/4|13:3:53:901 | call.machine.greeting.ended
[%s] LOG - Webhook received - amd result [%s] utc|2020/2/4|13:3:53:901 | beep_detected
[%s] LOG - SPEAK! utc|2020/2/4|13:3:53:901
[%s] DEBUG - Command Executed [%s] utc|2020/2/4|13:3:54:136 | speak

{ data: { result: 'ok' } }
[%s] LOG - Webhook received - event_type [%s] utc|2020/2/4|13:3:54:720 | call.speak.started
[%s] LOG - Webhook received - event_type [%s] utc|2020/2/4|13:3:59:197 | call.speak.ended
[%s] LOG - Hangup!" utc|2020/2/4|13:3:59:198
[%s] DEBUG - Command Executed [%s] utc|2020/2/4|13:3:59:482 | hangup

{ data: { result: 'ok' } }
[%s] LOG - Webhook received - event_type [%s] utc|2020/2/4|13:3:59:645 | call.hangup
[%s] LOG - OUTCOME - Left-Message

```



