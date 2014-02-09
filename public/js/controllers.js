'use strict';

sutterbus.controller('predictionsController',
  ['$scope', '$http', 'socket', '$routeParams', '$location',
	function($scope, $http, socket, $routeParams, $location)
{
  // Initialize variables needed.
  var predictions = $scope.predictions = [];

  // Post PsetID. If exists, then set data. Otherwise, redirect to root.
  $http.post('/getpredictions', {psetid: $routeParams.psetid} )
  .success(function(data) {
    $scope.predictions = data;
  })
  .error(function(data) {
    $location.path('/');
    console.log('Server error: ' + data);
  });

  // Receiving data from server and pushing to front-end.
  socket.on('predictions', function(data) {
    $scope.predictions = data;
  });
}]);

// Controller used to POST and save bus stop data to the API.
sutterbus.controller('setupController',
  ['$scope', '$http', '$location',
  function($scope, $http, $location)
{
  // Initialize variables.
  var stopInformation = $scope.stopInformation = {
    stops: [
      {
        route: '2',
        stopTag: '6608'
      },
      {
        route: '3',
        stopTag: '6592'
      }
    ],
    addStop: function addStop() {
      var obj = {};
      obj.route = '2';
      obj.stopTag = '6608';
      this.stops.push(obj);
    },
    removeStop: function removeStop(index) {
      this.stops.splice(index, 1);
    },
    submit: function submit() {
      // POST stop data to the server.
      $http.post('/save', this.stops)
      .success(function(data) {
        // Redirect it to new page.
        $location.path('/predictions/' + data.psetid);
      })
      .error(function(data) {
        console.log('Server error: ' + data);
      });
    }
  };
}]);