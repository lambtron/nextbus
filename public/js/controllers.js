'use strict';

sutterbus.controller('predictionsController',
  ['$scope', '$http', 'socket', '$routeParams', '$location',
	function ($scope, $http, socket, $routeParams, $location)
{
  // Initialize variables needed.
  var predictions = $scope.predictions = [];

  // Post PsetID. If exists, then set data. Otherwise, redirect to root.
  $http.post('/getpredictions', {psetid: $routeParams.psetid} )
  .success(function (data) {
    $scope.predictions = data;
  })
  .error(function (data) {
    $location.path('/');
    console.log('Server error: ' + data);
  });

  // Receiving data from server and pushing to front-end.
  socket.on('predictions', function (data) {
    $scope.predictions = data;
  });
}]);

// Controller used to POST and save bus stop data to the API.
sutterbus.controller('setupController',
  ['$scope', '$http', '$location',
  function($scope, $http, $location)
{

  var route = $scope.route = '';
  var direction = $scope.direction = '';
  var stop = $scope.stop = '';

  // Initialize variables.
  var stopInformation = $scope.stopInformation = {
    routes: [],
    directions: [],
    stops: [],
    selectedStops: [],
    getRoutes: function getRoutes() {
      $http.post('/setup')
      .success(function (data) {
        stopInformation.routes = data;
      })
      .error(function (data) {
        console.log('Server error: ' + data);
      })
    },
    getStopTags: function getStopTags(route) {
      // console.log(route);
      $http.post('/setup', {routeTag: route.tag} )
      .success(function (data) {
        // for (var i = 0; i < data.length; i++) {
        //   stopInformation.directions.push(data[i].direction);
        // }
        stopInformation.directions = data.directionsArr;
        stopInformation.stops = data.stopsArr;

        // [ { direction: 'hi'}, {...}]

        console.log(data);
      })
      .error(function (data) {
        console.log('Server error: ' + data);
      });
    },
    addStop: function addStop(route, stop) {
      var obj = {};
      obj.route = route.tag;
      obj.routeTitle = route.title;
      obj.stopTag = stop.stopTag;
      obj.stopTitle = stop.stopTitle;
      obj.direction = stop.direction;

      console.log(obj);

      this.selectedStops.push(obj);
    },
    removeStop: function removeStop(index) {
      this.selectedStops.splice(index, 1);
    },
    submit: function submit() {
      // POST stop data to the server.
      $http.post('/save', this.selectedStops)
      .success(function (data) {
        // Redirect it to new page.
        $location.path('/predictions/' + data.psetid);
      })
      .error(function (data) {
        console.log('Server error: ' + data);
      });
    }
  };

  stopInformation.getRoutes();
}]);