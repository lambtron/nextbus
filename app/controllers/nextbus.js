'use strict';

var http = require('http')
  , xml2js = require('xml2js')
  , parser = new xml2js.Parser()
  , _ = require('underscore')
  , moment = require('moment');

// Set static variables.
var a = 'sf-muni';
var stops = [{route: '2', stopTag: '6608'},
             {route: '3', stopTag: '6592'},
             {route: '38', stopTag: '4761'},
             {route: '38L', stopTag: '4294'}];

(function() {

  module.exports = {
    getAllPredictions: function getAllPredictions(fn) {
      var allPredictions = [];
      for(var i = 0; i < stops.length; i++) {
        getPrediction(a, stops[i].route, stops[i].stopTag, function(data) {
          allPredictions.push(data);
          if (allPredictions.length == stops.length)
            fn(_.sortBy(_.compact(_.flatten(allPredictions)), 'timeUntilArrival'));
        });
      }
    }
  };

  // a = sf-muni
  function getPrediction(a, r, stopTag, fn) {
    var options = {
      host: 'webservices.nextbus.com',
      path: '/service/publicXMLFeed?command=predictions&a=' + a + '&r=' + r +
            '&s=' + stopTag + '&useShortTitles=true'
    };

    // Make the HTTP request to Nextbus API.
    http.get(options, function(res) {
      var body = '';
      res.on('data', function(chunk) {
        body += chunk;
      });
      res.on('end', function() {
        parser.parseString(body, function(err, result) {
          // To get the stop title.
          // console.log(result.body.predictions[0].$.stopTitle);

          // To get the predictions.
          if (typeof result.body.predictions[0].direction === 'undefined') {
            fn(undefined);
          } else {
            var predictions = [];

            for( var i = 0;
              i < result.body.predictions[0].direction[0].prediction.length;
              i++ ) {
              var prediction = {};
              prediction.timeUntilArrival =
                Number(result.body.predictions[0].direction[0].prediction[i].$.minutes);
              prediction.timeOfArrival = moment().zone("-08:00").add('minutes',
                prediction.timeUntilArrival).format("h:mm");
              prediction.stopTitle = result.body.predictions[0].$.stopTitle;
              prediction.routeTitle = result.body.predictions[0].$.routeTitle;
              prediction.showMinutes = true;

              predictions.push(prediction);

              // After putting all of it into the array.
              if (predictions.length ==
                result.body.predictions[0].direction[0].prediction.length ) {
                fn(predictions);
              }
            }
          }
        });
      });
    });
  }

}());