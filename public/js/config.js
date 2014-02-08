sutterbus.config(function($routeProvider) {
	$routeProvider

	.when('/', {
		templateUrl : '/public/views/pages/setup.html',
		controller : 'setupController'
	})

	.when('/test', {
		templateUrl : '/public/views/pages/predictions.html',
		controller : 'predictionsController'
	});
});