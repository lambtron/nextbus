var Twilio = require('./app/helpers/twilio')
	, NextBus = require('./app/helpers/nextbus');

function sendText() {
	NextBus.getAllPredictions(function(data) {
    console.log(data);
    var body = '';
    for (var i = 0; i < data.length; i++ ) {
    	var line = data[i].timeUntilArrival + ' min at ' + data[i].stopTitle
    		+ ' for the ' + data[i].routeTitle + '.\n';
    	body = body + line;
    }
    Twilio.sendMessage('+12409887757', '+14157992563', body);
  });
}

sendText();