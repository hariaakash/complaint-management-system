angular.module('complaintApp')
	.controller('categoriesCtrl', function ($scope, $rootScope, $http, $location, $state, $timeout, $window) {
		$rootScope.checkAuth();
		$scope.getCategories = function () {
			$http({
					method: 'GET',
					url: $rootScope.apiUrl + 'user/categories'
				})
				.then(function (res) {
					if (res.data.status == true) {
						$scope.categories = res.data.data;
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
		$scope.getCategories();
		$rootScope.openCategory = function (x, y) {
			$('#' + x).modal('show');
			$scope.category = y;
		};
		$scope.addCategory = function () {
			$http({
					method: 'POST',
					url: $rootScope.apiUrl + 'admin/addCategory',
					data: {
						adminkey: $rootScope.adminkey,
						name: $scope.addCategoryForm.name,
						des: $scope.addCategoryForm.des
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
		$scope.addSubCategory = function () {
			$http({
					method: 'POST',
					url: $rootScope.apiUrl + 'admin/addSubCategory',
					data: {
						adminkey: $rootScope.adminkey,
						cid: $scope.addSubCategoryForm.cat.id,
						name: $scope.addSubCategoryForm.name,
						des: $scope.addSubCategoryForm.des
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
