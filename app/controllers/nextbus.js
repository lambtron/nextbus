'use strict';

var http = require('http')
  , xml2js = require('xml2js')
  , parser = new xml2js.Parser()
  , _ = require('underscore')
  , moment = require('moment');

// Set static variables.
var a = 'sf-muni';
// var stops = [{route: '2', stopTag: '6608'},
//              {route: '3', stopTag: '6592'},
//              {route: '38', stopTag: '4761'},
//              {route: '38L', stopTag: '4294'}];

(function() {

  module.exports = {
    getAllPredictions: function getAllPredictions(stops, cb) {
      var allPredictions = [];
      for(var i = 0; i < stops.length; i++) {
        getPrediction(a, stops[i].route, stops[i].stopTag, function(data) {
          allPredictions.push(data);
          if (allPredictions.length == stops.length)
            cb(_.sortBy(_.compact(_.flatten(allPredictions)), 'timeUntilArrival'));
        });
      }
    },
    getRoutes: function getRoutes(cb) {
      var path = '/service/publicXMLFeed?command=routeList&a=' + a;

      getNextBus(path, function(err, result) {
        // result.body.route = [];
        // result.body.route[0].$.tag = 'F'
        // result.body.route[0].$.title = 'F-market & wharves'
        var arr = [];
        for (var i = 0; i < result.body.route.length; i++ ) {
          var obj = {};
          obj.route = result.body.route[i].$.tag;
          obj.title = result.body.route[i].$.title;
          arr.push(obj);
        }
        cb(arr);
      });
    },
    getRouteDirections: function getRouteDirections(route, cb) {
      var path = '/service/publicXMLFeed?command=routeConfig&a=' + a +
        '&r = ' + route;

      getNextBus(path, function(err, result) {
        console.log(result.body);
      });
    },
    getStopIds: function getStopIds(route, routeDirection, cb) {
      var path = '/service/publicXMLFeed?command'

      cb();
    }
  };

  // This function makes all HTTP requests to nextbus API.
  function getNextBus(path, cb) {
    var options = {
      host: 'webservices.nextbus.com',
      path: path
    };

    http.get(options, function(res) {
      var body = '';
      res.on('data', function(chunk) {
        body += chunk;
      });
      res.on('end', function() {
        parser.parseString(body, cb);
      });
    });
  }

  // a = sf-muni
  function getPrediction(a, r, stopTag, cb) {
    var path = '/service/publicXMLFeed?command=predictions&a=' + a + '&r=' +
      r + '&s=' + stopTag + '&useShortTitles=true';
    getNextBus(path, function(err, result) {
      // To get the stop title.
      // console.log(result.body.predictions[0].$.stopTitle);

      // To get the predictions.
      if (typeof result.body.predictions[0].direction === 'undefined') {
        cb(undefined);
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
        }

        cb(predictions);
      }
    });
  }

}());