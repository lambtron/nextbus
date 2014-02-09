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
  , Pset = mongoose.model('Pset')
  , Hashids = require('hashids');

// Initialize hashing variables.
var counter = Math.floor(Math.random()*1000)
  , salt = Math.random().toString(36).substring(10)
  , hashids = new Hashids(salt, 12);

// Public functions. ===========================================================
module.exports = function(app, io) {

  // This will check to see if the pset id exists, if so, return predictions.
	app.post('/getpredictions', function(req, res) {

    // Checking to see if Pset ID exists.
    Pset.findOne( {url_endpoint: req.body.psetid}, function(err, pset) {
      if (err)
        res.send(err, 400);

      if (pset) {
        // If pset exists, then return nextbus predictions!
        startLoop(pset.stops);
        var interval = setInterval(function(){startLoop(pset.stops);}, 10000);
      } else {
        // If pset does not exist, tell controller to redirect to '/'.
        console.log('PSet ID does not exist; redirecting user to root.');
        res.send('redirect', 302);
      }
    });

    var startTime = new Date().getTime();
    function startLoop(stops) {
      // Stop after five minutes.
      if(new Date().getTime() - startTime > 300000){
        clearInterval(interval);
        return;
      }

      NextBus.getAllPredictions(stops, function(data) {
        io.sockets.emit('predictions', data);
        res.send(data, 200);
      });
    }
	});

  // Save bus stop information.
  app.post('/save', function(req, res) {
    // req.body is an Array:
    // [ { route: '2', stopTag: '6608' },
    //   { route: '3', stopTag: '6592' } ]
    // TODO: also add phone number!
    var stops = req.body;

    // Validate. (But this can be done later)

    // Generate a unique URL endpoint for this set.
    var new_url_endpoint = hashids.encrypt(counter);
    counter = counter + 1;

    // Save it to MongoDB.
    Pset.create({
      phone_number: '',
      url_endpoint: new_url_endpoint,
      stops: stops
    }, function(err, pset) {
      console.log('successfully created a new pset');

      if (err)
        res.send(err, 400);
      else
        res.send({psetid: new_url_endpoint}, 200);
    });
  });

	// Application route =========================================================
	app.get('/*', function(req, res) {
    res.sendfile('index.html', {'root': './public/views/'});
  });
};

}());