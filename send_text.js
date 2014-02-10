// Set environmental variables.
// require('./config/config');

var Twilio = require('./app/controllers/twilio')
	, NextBus = require('./app/controllers/nextbus')
  , _ = require('underscore');

var stops = [{route: '2', stopTag: '6608'},
             {route: '3', stopTag: '6592'},
             {route: '38', stopTag: '4761'},
             {route: '38L', stopTag: '4294'}];

// Need to order these.
function sendText() {
	NextBus.getAllPredictions(stops, function (data) {
    var itr = Math.min(data.length, 6);
    var body = '';
    for (var i = 0; i < itr; i++ ) {
    	var line = data[i].timeUntilArrival + ' min at ' + data[i].stopTitle
    		+ ' for the ' + data[i].routeTitle + '.\n';
    	body = body + line;
    }
    body = body + "For more, check out sutterbus.herokuapp.com/";
    Twilio.sendMessage('+12409887757', body);
  });
}

sendText();