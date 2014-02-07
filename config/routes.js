'use strict';

(function() {

/**
 * Import helpers ==============================================================
 */
var NextBus = require('../app/helpers/nextbus');

// Public functions. ===========================================================
module.exports = function(app, io) {

	// Return bus predictions.
	app.get('/nextbus', function(req, res) {

    function startLoop() {
      // Stop after five minutes.
      if(new Date().getTime() - startTime > 300000){
        clearInterval(interval);
        return;
      }
      NextBus.getAllPredictions(function(data) {
        console.log(data);
        io.sockets.emit('predictions', data);
        res.send(data, 200);
      });
    }

    var startTime = new Date().getTime();
    startLoop();
    var interval = setInterval(startLoop, 10000);
	});

	// Application route =========================================================
	app.get('*', function(req, res) {
		// Load the single view file (Angular will handle the page changes).
		res.sendfile('index.html', {'root': './public/views/'});
	});
}

}());