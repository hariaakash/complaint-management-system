angular.module('complaintApp')
	.controller('complaintCtrl', function ($scope, $rootScope, $http, $location, $state, $timeout, $window, $stateParams) {
		$rootScope.checkAuth();
		$scope.cId = $stateParams.cId;
		$scope.getComplaint = function () {
			if ($scope.cId) {
				$http({
						method: 'GET',
						url: $rootScope.apiUrl + 'admin/complaint',
						params: {
							adminkey: $rootScope.adminkey,
							cid: $scope.cId
						}
					})
					.then(function (res) {
						if (res.data.status == true) {
							$rootScope.complaintData = res.data.data;
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
		$scope.getComplaint();
		$scope.complaintReply = function () {
			$http({
					method: 'POST',
					url: $rootScope.apiUrl + 'admin/complaintReply',
					data: {
						adminkey: $rootScope.adminkey,
						cid: $scope.cId,
						msg: $scope.newReply
					}
				})
				.then(function (res) {
					if (res.data.status == true) {
						swal({
							title: 'Success',
							text: res.data.msg,
							type: 'success',
							showConfirmButton: true
						}).then(function () {
							$window.location.reload();
						});
					} else {
						swal({
							title: 'Failed',
							text: res.data.msg,
							type: 'error',
							timer: 2000,
							showConfirmButton: true
						});
					}
				}, function (res) {
					swal("Fail", "Some error occurred, try again.", "error");
				});
		};
		$scope.closeTicket = function () {
			$http({
					method: 'POST',
					url: $rootScope.apiUrl + 'admin/complaintClose',
					data: {
						adminkey: $rootScope.adminkey,
						cid: $scope.cId
					}
				})
				.then(function (res) {
					if (res.data.status == true) {
						swal({
							title: 'Success',
							text: res.data.msg,
							type: 'success',
							showConfirmButton: false
						});
						$timeout(function () {
							$window.location.reload();
						}, 2000);
					} else {
						swal({
							title: 'Failed',
							text: res.data.msg,
							type: 'error',
							timer: 2000,
							showConfirmButton: true
						});
					}
				}, function (res) {
					swal("Fail", "Some error occurred, try again.", "error");
				});
		};
	});
