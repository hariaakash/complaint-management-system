angular.module('complaintApp')
	.controller('userCtrl', function ($scope, $rootScope, $http, $location, $state, $timeout, $window, $stateParams) {
		$rootScope.checkAuth();
		$scope.uId = $stateParams.uId;
		$scope.getUser = function () {
			if ($scope.uId) {
				$http({
						method: 'GET',
						url: $rootScope.apiUrl + 'admin/user',
						params: {
							adminkey: $rootScope.adminkey,
							uid: $scope.uId
						}
					})
					.then(function (res) {
						if (res.data.status == true) {
							$scope.userData = res.data.data;
						} else {
							swal({
								title: 'Failed',
								text: res.data.msg,
								type: 'error',
								showConfirmButton: false
							});
							$timeout(function () {
								$state.go('dashboard.home')
							}, 2000);
						}
					}, function (res) {
						swal("Fail", "Some error occurred, try again.", "error");
					});
			} else {
				$state.go('dashboard.home');
			}
		};
		$scope.getUser();
	});
