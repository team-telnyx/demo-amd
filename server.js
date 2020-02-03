// ============================================== Telnyx AMD Demo =========================================

// Description:
// This app is creating a demo of our AMD application

// Stetphen Malito (stephenm@telnyx.com)

// Application:
const g_appName = "telnyx-amd";

// TTS Options
const g_ivr_voice = "female";
const g_ivr_language = "en-US";

// ======= Conventions =======
// = g_xxx: global variable
// = f_xxx: function variable
// = l_xxx: local variable
// ===========================

// ================================================ Dependencies =======================================================

const express = require("express");
const request = require("request");

// =============================================== Telnyx Account Details ==============================================
// Storing all our secure credentials and information in telnyx_auth
const telnyx_auth = require("./telnyx-config");
// Telnyx ApiV2 Key
const g_telnyx_api_auth_v2 = telnyx_auth.api;
// Connection ID to place outbound Dial on
const g_connection_id = telnyx_auth.connection_id;
// Phone number we will try to connect with
const g_parent_did = telnyx_auth.parent_number;
// Telnyx DID configured for this App in Mission Control
const g_call_control_did = telnyx_auth.telnyx_did;

// DRY - Post Request Headers
const g_post_headers = {
	"Content-Type": "application/json",
	Accept: "application/json",
	Authorization: `Bearer ${g_telnyx_api_auth_v2}`
};

// ================================================ RESTful API Creation ================================================

const rest = express();

rest.use(express.json());

// ================================================ AUXILIARY FUNCTIONS  ================================================

// Generate Timestamp
const get_timestamp = () => {
	var now = new Date();

	return (
		"utc|" +
		now.getUTCFullYear() +
		"/" +
		(now.getUTCMonth() + 1) +
		"/" +
		now.getUTCDate() +
		"|" +
		now.getHours() +
		":" +
		now.getMinutes() +
		":" +
		now.getSeconds() +
		":" +
		now.getMilliseconds()
	);
};

// ================================================ TELNYX COMMANDS API  ================================================

// Call Control - Dial
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
			answering_machine_detection: "detect_words"
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

// Call Control - Speak
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
// Call Control - Hangup
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

// ================================================    WEBHOOK API IVR   ================================================


// GET - Make Sure we're Live: https://<your_webhook_url>:8081
rest.get("/", (req, res) => {
	res.send(`<h1>Telnyx APIv2 Follow Me Demo is Running!</h1>`);
});

// POST - Receive Number: https://<your_webhook_url>:8081/telnyx-amd
rest.post(`/${g_appName}`, (req, res) => {
	if (req && req.body && req.body.data.event_type) {
		var l_hook_event_type = req.body.data.event_type;
		var l_call_control_id = req.body.data.payload.call_control_id;
		var l_client_state_64 = req.body.data.payload.client_state;
		var l_call_state = req.body.data.payload.state;
	} else {
		console.log(`[%s] LOG - Invalid Webhook received! ${get_timestamp()}`);
		res.end("0");
	}

	// Log Event Hook
	console.log(
		`[%s] LOG - Webhook received - event_type [%s] ${get_timestamp()} | ${l_hook_event_type}`
	);
	
	// Log AMD Result
	if (req.body.data.payload.result)  {
		console.log(
			`[%s] LOG - Webhook received - amd result [%s] ${get_timestamp()} | ${req.body.data.payload.result}`
		);
	}

	// Call Initiated >> Do Nothing
	if (l_hook_event_type == "call.initiated") {
		res.end();

		// Webhook Dial answered by User or Machine - Command Speak
	} else if (l_hook_event_type == "call.answered") {

		call_control_speak(
			g_post_headers,
			l_call_control_id,
			`This is a message from ABC123 School, Your Child has been Bad, Bad, Bad, and Has Detention`,
			"Parent-Answer"
		);

		res.end();

		// Webhook Call Machine Detection Ended - We have detected a Machine
	} else if (l_hook_event_type == "call.machine.detection.ended") {
		
		res.end();
		// Webhook Call Machine Greeting Ended - We have detected a Beep >> Leave Message
	} else if (l_hook_event_type == "call.machine.greeting.ended") {
	

		call_control_speak(
			g_post_headers,
			l_call_control_id,
			`This is a message from ABC123 School, Your Child has been Bad, Bad, Bad, and Has Detention`,
			"Left-Message"
		);

		res.end();
		// Webhook Call Call Bridged >> Do Nothing
	} else if (l_hook_event_type == "call.bridged") {
		res.end();
		// Webhook Call Speak Started >> Do Nothing
	} else if (l_hook_event_type == "call.speak.started") {
		res.end();
		// Webhook Call Hangup >>  Log Left Message/Reached Parent
	} else if (l_hook_event_type == "call.hangup") {
		console.log(
			`[%s] LOG - OUTCOME - ${Buffer.from(l_client_state_64, "base64").toString(
				"ascii"
			)}`
		);
		res.end();
		// Webhook to Listen for DTMF
	} else if (l_hook_event_type == "call.dtmf.received") {
		res.end();
		// Webhook Gather Ended >> Do Nothing 
	} else if (l_hook_event_type == "call.gather.ended") {
		res.end();
		// Webhook Speak Ended >> Hang Up the Call
	} else if (l_hook_event_type == "call.speak.ended") {
			//Only if the call was "Left-Message" - No reason to decode base64
		if (l_client_state_64 == "TGVmdC1NZXNzYWdl") {
			call_control_hangup(g_post_headers, l_call_control_id);
		}
		
		

		res.end();
	}
});

// ================================================ RESTful Server Start ================================================

const PORT = 8081;
rest.listen(PORT, () => {
	console.log(
		`SERVER ${get_timestamp()} -  app listening at http://localhost:${PORT}/${g_appName}`
	);
});

// Kick off App
call_control_dial(
	g_post_headers,
	g_connection_id,
	g_parent_did,
	g_call_control_did,
	"stage-dial"
);
