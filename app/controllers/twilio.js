//require the Twilio module and create a REST client
var client = require('twilio')(process.env.TWILIO_ASID, process.env.TWILIO_AUTH_TOKEN);

// Send an SMS text message
module.exports = {
  sendMessage: function(to, from, body) {
    client.sendMessage({
      to: to,
      from: from,
      body: body
    }, function(err, responseData) {
      if (!err) {
        // console.log(responseData);
      } else {
        console.log('Twilio error: ' + err);
      }
    });
  },
  standardizePhoneNumber: function(phone_number) {
    // 2409887757 to +12409887757
    var new_phone_number = phone_number + '';
    if (new_phone_number.length == 10 || new_phone_number.substring(0,2) != '+1') {
      new_phone_number = '+1' + new_phone_number;
    };
    return new_phone_number;
  }
};