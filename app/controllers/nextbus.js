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
        getPrediction(a, stops[i].route, stops[i].stopTag, function(err, data) {
          allPredictions.push(data);
          if (allPredictions.length == stops.length) {
            cb(err, _.sortBy(_.compact(_.flatten(allPredictions)),
              'timeUntilArrival'));
          }
        });
      }
    },
    getRoutes: function getRoutes(cb) {
      var path = '/service/publicXMLFeed?command=routeList&a=' + a;

      getNextBus(path, function (err, result) {
        // result.body.route = [];
        // result.body.route[0].$.tag = 'F'
        // result.body.route[0].$.title = 'F-market & wharves'
        var arr = [];
        for (var i = 0; i < result.body.route.length; i++ ) {
          var obj = {};
          obj.tag = result.body.route[i].$.tag;
          obj.title = result.body.route[i].$.title;
          arr.push(obj);
        }

        cb(err, arr);
      });
    },
    getRouteDirections: function getRouteDirections(routeTag, cb) {
      var path = '/service/publicXMLFeed?command=routeConfig&a=' + a +
        '&r=' + routeTag;

      getNextBus(path, function (err, result) {
        // result.body.route[0] = {$, stop, direction}
        // result.body.route[0].direction = []
        // result.body.route[0].direction[i].$.title = 'Inbound to Downtown'
        // result.body.route[0].direction[i].stop[j].$.tag = '4294'

        // result.body.route[0].stop[0].$.tag = '4292'
        // result.body.route[0].stop[0].$.title = 'Geary Blvd & Divisidero St'

        var stops = result.body.route[0].stop;
        var directions = result.body.route[0].direction;

        var stopHash = {};
        for (var i = 0; i < stops.length; i++) {
          var stopTag = stops[i].$.tag;

          if (!stopHash.hasOwnProperty(stopTag))
            stopHash[stopTag] = stops[i].$.title;
        }

        var results = {};
        results.directionsArr = [];
        results.stopsArr = [];

        // This array has stop tags and titles based on direction.
        for (i = 0; i < directions.length; i++) {
          var obj = {};
          obj.direction = directions[i].$.title;
          results.directionsArr.push(obj);

          for (var j = 0; j < directions[i].stop.length;
            j++ ) {
            var obj2 = {};
            obj2.direction = obj.direction;
            obj2.stopTag = directions[i].stop[j].$.tag;
            obj2.stopTitle = stopHash[obj2.stopTag];

            results.stopsArr.push(obj2);
          }
        }

        // {
        //   directionArr: [{direction: 'Inbound'}, {direction: 'Outbound'}, ..],
        //   stopTagArr: [{direction: 'Inbound', stopTag: '5253', stopTitle: 'Judah st'}, ..]
        // }

        cb(err, results);
      });
    }
  };

  // This function makes all HTTP requests to nextbus API.
  function getNextBus(path, cb) {
    var options = {
      host: 'webservices.nextbus.com',
      path: path
    };

    http.get(options, function (res) {
      var body = '';
      res.on('data', function (chunk) {
        body += chunk;
      });
      res.on('end', function () {
        parser.parseString(body, cb);
      });
    });
  }

  // a = sf-muni
  function getPrediction(a, r, stopTag, cb) {
    var path = '/service/publicXMLFeed?command=predictions&a=' + a + '&r=' +
      r + '&s=' + stopTag + '&useShortTitles=true';
    getNextBus(path, function (err, result) {
      // To get the stop title.
      // console.log(result.body.predictions[0].$.stopTitle);

      // To get the predictions.
      if (typeof result.body.predictions[0].direction === 'undefined') {
        cb(undefined, undefined);
      } else {
        var predictions = [];

        for( var i = 0;
          i < result.body.predictions[0].direction[0].prediction.length;
          i++ ) {
          var prediction = {};
          prediction.timeUntilArrival =
            Number(result.body.predictions[0].direction[0].prediction[i]
            .$.minutes);
          prediction.timeOfArrival = moment().zone('-08:00').add('minutes',
            prediction.timeUntilArrival).format('h:mm');
          prediction.stopTitle = result.body.predictions[0].$.stopTitle;
          prediction.routeTitle = result.body.predictions[0].$.routeTitle;
          prediction.showMinutes = true;

          predictions.push(prediction);
        }

        cb(err, predictions);
      }
    });
  }

}());