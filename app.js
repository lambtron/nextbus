/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , xml2js = require('xml2js');

var app = express();
var parser = new xml2js.Parser();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

console.log(__dirname);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Get and show the home page.
app.get('/', function (req, res) {

  // Agency is SF-Muni by default.
  var a = 'sf-muni';

  // For our purposes, we will select the following static variables:
  //  a = sf-muni
  //  routes = 38, 38L, 2, 3 // ALL INBOUND TO TERMINAL BAY
  //  stops = geary+diviz, geary+scott, scott+sutter, sutter+fillmore
  var routes = ['2', '3', '38', '38L'];
  var stopIds = ['16608', '16592', '14761', '14294'];
  var stops = [{route: '2', stopTag: '6608'},
               {route: '3', stopTag: '6592'},
               {route: '38', stopTag: '4761'},
               {route: '38L', stopTag: '4294'}];
  var predictions = [];

  getAllPredictions(a, stops, function(predictions) {
    console.log('final predictions: ' + predictions);
    res.render('index.jade', {pageData: {name: predictions}});
  });
});

app.post('/get-stop-tags', function (req, res) {
  // Post req.
  getStopTags('sf-muni', req, function(data) {
    console.log(data);
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


// Functions.
function getLatLon(address, fn) {

}

function getNearbyStops(a, start, end, fn) {
  // start.lat, start.lon
  // end.lat, end.lon
}


function getRouteTags(a, fn) {
  var routeTags = [];

  // Get array of route tags.
  var options = {
    host: 'webservices.nextbus.com',
    path: '/service/publicXMLFeed?command=routeList&a=' + a
  };

  http.get(options, function(res) {
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      parser.parseString(body, function(err, result) {
        for(var i=0; i<result.body.route.length; i++) {
          // result.body.route[i].$.tag
          // result.body.route[i].$.title
          // result.body.route[i].$.shortTitle
          routeTags.push(result.body.route[i].$);
        };
        fn(routeTags); // The passed function executes here.
      });
    });
  }).on('error', function(e) {
    console.log('Error: ' + e.message);
  });
}

function getStopTags(a, routeTag, fn) {
  var stopTags = [];

  // Get array of stop tags.
  var options = {
    host: 'webservices.nextbus.com',
    path: '/service/publicXMLFeed?command=routeConfig&a=' + a + '&r=' + routeTag
  };

  http.get(options, function(res) {
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      parser.parseString(body, function(err, result) {
        for(var i=0; i<result.body.route[0].stop.length; i++) {
          // result.body.route[0].stop[i].$.stopId
          // result.body.route[0].stop[i].$.title
          // result.body.route[0].stop[i].$.lat
          // result.body.route[0].stop[i].$.lon
          // result.body.route[0].stop[i].$.tag
          stopTags.push(result.body.route[0].stop[i].$);
        };
        fn(stopTags); // The passed function executes here.
      });
    });
  }).on('error', function(e) {
    console.log('Error: ' + e.message);
  });
}

// function getPrediction(a, stopId, fn) {
//   var options = {
//     host: 'webservices.nextbus.com',
//     path: '/service/publicXMLFeed?command=predictions&a=' + a + '&stopId=' + stopId + '&useShortTitles=true'
//   };

//   http.get(options, function(res) {
//     var body = '';
//     res.on('data', function(chunk) {
//       body += chunk;
//     });
//     res.on('end', function() {
//       parser.parseString(body, function(err, result) {
//         // if(typeof result.body.predictions[0].direction === 'undefined')
//         //   console.log('undefined by andy');
//         // else
//         //   console.log(result.body.predictions[0].direction[0].prediction[0].$.minutes);
//         // console.log('new line');
//         if(typeof result.body.predictions[0].direction === 'undefined') {
//           console.log('undefined by andy');
//         } else {
//           for(var i=0; i<result.body.predictions[0].direction[0].prediction[0].$.minutes.length; i++) {
//             console.log(result.body.predictions[0].direction[0].prediction[i].$.minutes);
//             fn(result.body);
//           };
//         };

//       });
//     });
//   });
// }

function getAllPredictions(a, stops, fn) {
  predictions = [];
  for(var i=0; i<stops.length; i++) {
    getPrediction(a, stops[i].route, stops[i].stopTag, function(d) {
      predictions.push(d);
      if (predictions.length == stops.length)
        fn(predictions);
    });
  };
}

function getPrediction(a, r, stopTag, fn) {
  var options = {
    host: 'webservices.nextbus.com',
    path: '/service/publicXMLFeed?command=predictions&a=' + a + '&r=' + r + '&s=' + stopTag + '&useShortTitles=true'
  };

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
        if(typeof result.body.predictions[0].direction === 'undefined') {
          fn('undefined');
        } else {
          var predictions = [];

          for(var i=0; i<result.body.predictions[0].direction[0].prediction.length; i++) {
            var prediction = {};
            prediction.timeUntilArrival = result.body.predictions[0].direction[0].prediction[i].$.minutes;
            prediction.stopTitle = result.body.predictions[0].$.stopTitle;
            prediction.routeTitle = result.body.predictions[0].$.routeTitle;

            predictions.push(prediction);

            // After putting all of it into the array.
            if (predictions.length ==result.body.predictions[0].direction[0].prediction.length ) {
              fn(predictions);
            };
          };
        };
      });
    });
  });
}