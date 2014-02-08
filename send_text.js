// Set environmental variables.
require('./config/config');

var Twilio = require('./app/controllers/twilio')
	, NextBus = require('./app/controllers/nextbus')
    , _ = require('underscore');

// Need to order these.
function sendText() {
	NextBus.getAllPredictions(function(data) {

    // Sort the data.
    console.log(data);
    var body = '';
    for (var i = 0; i < data.length; i++ ) {
    	var line = data[i].timeUntilArrival + ' min at ' + data[i].stopTitle
    		+ ' for the ' + data[i].routeTitle + '.\n';
    	body = body + line;
    }
    body = body + "For more, check out sutterbus.herokuapp.com/";
    Twilio.sendMessage('+12409887757', body);
  });
}

sendText();