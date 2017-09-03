angular.module('complaintApp')
	.controller('homeCtrl', function ($scope, $rootScope, $http, $location, $state, $timeout, $window) {
		$rootScope.checkAuth();
	});
