sutterbus.config( ['$routeProvider', '$locationProvider',
function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $routeProvider.
  when('/', {
    templateUrl: 'public/views/pages/setup.html',
    controller: 'setupController'
  }).
  when('/predictions/:psetid', {
    templateUrl: 'public/views/pages/predictions.html',
    controller: 'predictionsController'
  }).
  otherwise({
    redirectTo: '/'
  });
}]);