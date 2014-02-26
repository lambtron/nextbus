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
  , HashIds = require('hashids')
  , analytics = require('analytics-node')
  , moment = require('moment');

// Initialize hashing variables.
var counter = Math.floor(Math.random()*1000)
  , salt = Math.random().toString(36).substring(10)
  , hashIds = new HashIds(salt, 12);

analytics.init({ secret: 'omrf1m7qy7' });

// Public functions. ===========================================================
module.exports = function (app, io) {

  // This will check to see if the pset id exists, if so, return predictions.
	app.post('/getpredictions', function (req, res) {

    // Checking to see if Pset ID exists.
    Pset.findOne( {pset_id: req.body.psetid}, function (err, pset) {
      if (err)
        res.send(err, 400);

      if (pset) {
        // If pset exists, then return nextbus predictions!
        pset.updateLastChecked();

        // Translate psets.stops data to strings.
        var stops = '';
        for (var i = 0; i < pset.stops.length; i++) {
          stops = stops + pset.stops[i].route + ' at ' + pset.stops[i].stopTag;
          if (i < pset.stops.length)
            stops = stops + ', ';
        }

        // Track the event of retrieving predictions.
        analytics.track({
          userId     : pset.pset_id,
          event      : 'Retrieved a prediction',
          properties : {
            stops: stops,
            dayOfWeek: moment().weekday(),
            date: moment().toString(),
            month: moment().month() + 1,
            hour: moment().hour()
          }
        });

        var startTime = new Date().getTime();
        var startLoop = function startLoop (stops) {
          // Stop after five minutes (300,000 seconds)
          if(new Date().getTime() - startTime > 300000){
            clearInterval(interval);
            return;
          }
          NextBus.getAllPredictions(stops, function (err, data) {
            if (err)
              res.send(err, 400);
            else {
              io.of('/' + pset.pset_id).emit('predictions', data);
              res.send(data, 200);
            }
          });
        };
        startLoop(pset.stops);
        var interval = setInterval( function() {
          startLoop(pset.stops);
        }, 10000);
      } else {
        // If pset does not exist, tell controller to redirect to '/'.
        console.log('PSet ID does not exist; redirecting user to root.');
        res.send('redirect', 302);
      }
    });
	});

  // Save bus stop information.
  app.post('/save', function (req, res) {
    // req.body is an Array:
    // [ { route: '2', stopTag: '6608' },
    //   { route: '3', stopTag: '6592' } ]
    // TODO: also add phone number!
    var stops = req.body;

    // Generate a unique URL endpoint for this set.
    var psetId = hashIds.encrypt(counter);
    counter = counter + 1;

    // Translate psets.stops data to strings.
    var stopsToString = '';
    for (var i = 0; i < stops.length; i++) {
      stopsToString = stopsToString + stops.route + ' at ' + stops.stopTag;
      if (i < stops.length)
        stopsToString = stopsToString + ', ';
    }

    // Track the event of saving a prediction.
    analytics.track({
      userId     : psetId,
      event      : 'Saved a prediction',
      properties : {
        stops: stopsToString,
        dayOfWeek: moment().weekday(),
        date: moment().toString(),
        month: moment().month() + 1,
        hour: moment().hour()
      }
    });

    // Save it to MongoDB.
    Pset.create({
      phone_number: '',
      pset_id: psetId,
      stops: stops
    }, function(err, pset) {
      console.log('successfully created a new pset');

      if (err)
        res.send(err, 400);
      else
        res.send({psetid: psetId}, 200);
    });
  });

  // Input is bus line, output is direction.
  // Input is bus line + direction, output is array of stops
  // (incl. short title).
  app.post('/setup', function (req, res) {
    // Check the req.body.

    if (req.body.routeTag) {
      // Have just a route?
      NextBus.getRouteDirections(req.body.routeTag, function(err, data) {
        if (err)
          res.send(err, 400);
        else
          res.send(data);
      });

      // Return an of directions and stops (inbound vs outbound, etc).
    } else {
      // No route information? No problem.
      NextBus.getRoutes(function (err, data) {
        if (err)
          res.send(err, 400);
        else
          res.send(data);
      });

      // Return an array of routes.
    }
  });

	// Application route =========================================================
	app.get('/*', function (req, res) {
    res.sendfile('index.html', {'root': './public/views/'});
  });
};

}());