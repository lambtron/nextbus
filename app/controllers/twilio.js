//require the Twilio module and create a REST client
var client = require('twilio')(process.env.TWILIO_ASID,
  process.env.TWILIO_AUTH_TOKEN);

// Send an SMS text message
module.exports = {
  sendMessage: function(to, body) {
    client.sendMessage({
      to: to,
      from: process.env.TWILIO_NUMBER,
      body: body
    }, function(err, responseData) {
      if (!err) {
        // console.log(responseData);
      } else {
        console.log('Twilio error: ' + err);
      }
    });
  }
};