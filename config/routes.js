'use strict';

(function() {

/**
 * Import model ================================================================
 */
require('../app/models/pset');

/**
 * Import helpers ==============================================================
 */
var NextBus = require('../app/controllers/nextbus')
  , mongoose = require('mongoose')
  , Pset = mongoose.model('Pset');

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
    // Check if the route exists in the database.
    var route = req.route.params[0].substr(1);

    // If it exists, then render another file with another controller that
    // hits the nextbus endpoint.
 //    Pset.findOne( {url_endpoint: route}, function(err, pset) {
 //      if (err)
 //        res.send(err, 400);

 //      // if (pset)
 //      //   res.sendfile('index.html', {'root': './public/views/'});
 //      // else
 //      //   res.sendfile('setup.html', {'root': './public/views/'});
 //      res.sendfile('index.html', {'root': './public/views/'});
 //    });

    res.sendfile('index.html', {'root': './public/views/'});
  });
};

}());