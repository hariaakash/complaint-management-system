angular.module("complaintApp", ['ui.router', 'oc.lazyLoad'])
	.config(function ($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise('/home');
		$stateProvider
			.state("dashboard", {
				url: "",
				templateUrl: "pages/dashboard.html",
				abstract: true
			})
			.state("dashboard.home", {
				url: "/home",
				templateUrl: "pages/home.html",
				controller: "homeCtrl",
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load('./ctrls/home.js');
    				}]
				}
			})
			.state("dashboard.complaint", {
				url: "/complaint/:cId",
				templateUrl: "pages/complaint.html",
				controller: "complaintCtrl",
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load('./ctrls/complaint.js');
    				}]
				}
			})
			.state("dashboard.register", {
				url: "/register",
				templateUrl: "pages/register.html",
				controller: "registerCtrl",
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'Register',
							files: ['./ctrls/register.js']
						})
					}]
				}
			})
			.state("dashboard.login", {
				url: "/login",
				templateUrl: "pages/login.html",
				controller: "loginCtrl",
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
						return $ocLazyLoad.load({
							name: 'Login',
							files: ['./ctrls/login.js']
						})
					}]
				}
			});
	});


// Global Controller
angular.module('complaintApp')
	.controller('globalCtrl', function ($scope, $rootScope, $location, $http, $state, $ocLazyLoad) {
		$rootScope.apiUrl = 'http://localhost:3000/';
		$ocLazyLoad.load(['./plugins/sweetalert2/sweetalert2.min.js', './plugins/sweetalert2/sweetalert2.min.css'])
		$rootScope.checkAuth = function () {
			if (Cookies.get('authkey')) {
				$rootScope.authkey = Cookies.get('authkey');
				$http({
						method: 'GET',
						url: $rootScope.apiUrl + 'user',
						params: {
							authkey: $rootScope.authkey
						}
					})
					.then(function (res) {
						if (res.data.status == true) {
							$rootScope.homeData = res.data.data;
							console.log(res.data.data)
						} else {
							$rootScope.logout();
							swal({
								title: 'Failed',
								text: res.data.msg,
								type: 'error',
								timer: 2000,
								showConfirmButton: true
							});
						}
					}, function (res) {
						$('#btnLoad').button('reset');
						swal("Fail", "Some error occurred, try again.", "error");
					});
				var path = $location.path();
				if (path == '/login' || path == '/register')
					$state.go('dashboard.home');
				$rootScope.signStatus = true;
			} else {
				$rootScope.authkey = '';
				$rootScope.signStatus = false;
				var path = $location.path();
				if (path == '/home' || path == '')
					$state.go('dashboard.login');
			}
		};
		$rootScope.logout = function () {
			Cookies.remove('authkey');
			swal("Success", "Logged out successfully !!", "success");
		};
		$rootScope.openModal = function (x) {
			$('#' + x).modal('show');
		};
	});
