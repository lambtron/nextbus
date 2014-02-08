'use strict';

sutterbus.controller('predictionsController', ['$scope', '$http', 'socket',
	function($scope, $http, socket)
{
  // Initialize variables needed.
  var predictions = $scope.predictions = [];

  $http.get('/nextbus')
  .success(function(data) {
    $scope.predictions = data;
    // console.log(data);
  })
  .error(function(data) {
    console.log('Error: ' + data);
  });

  // Receiving data from server and pushing to front-end.
  socket.on('predictions', function(data) {
    $scope.predictions = data;
    // console.log(data);
  });
}]);

sutterbus.controller('setupController', ['$scope', '$http',
  function($scope, $http)
{

}]);