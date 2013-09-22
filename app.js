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

  getRouteTags(a, function(data) {
    // console.log(data);

    console.log(data[0]);
    for(var i=0; i<data.length; i++) {
      getStopTags(a, data[0].tag, function(d) {
        console.log(d);
      });
    }

    res.render('index.jade', {data: {routeTags: data}});
  });

  // var routeTag = '38L';
  // getStopTags(a, routeTag, function(data) {
  //   console.log(data);
  // });

  // Display selection on front end.
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