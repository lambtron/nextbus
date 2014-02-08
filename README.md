=======
NextBus
=======

This little app lets you see the prediction times of buses at stops and routes
near you.

Setup:

Add a config/config.js file. In this file, have the following:

process.env.TWILIO_ASID = 'ACxx';
process.env.TWILIO_AUTH_TOKEN = 'beyy';
process.env.TWILIO_NUMBER = '+1415zz';

In the .app/controllers/nextbus.js file, change the static variables to the agency,
stops, and route information to ones applicable to you.

var a = 'sf-muni';
var stops = [{route: '2', stopTag: '6608'},
             {route: '3', stopTag: '6592'},
             {route: '38', stopTag: '4761'},
             {route: '38L', stopTag: '4294'}];

Then deploy it and you will be ready to go.