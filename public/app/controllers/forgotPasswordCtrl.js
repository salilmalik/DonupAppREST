(function() {
	'use strict';
	var app = angular.module('donup');
	app.controller('ForgotPasswordCtrl', [
			'$scope',
			'$location',
			'UserService',
			function($scope, $location, userService) {
				$scope.user = {};
				$scope.sendPassword = function() {
					$scope.dataLoading = true;
					userService.forgotPassword($scope.user).success(
							function(data) {
								if (data.returnCode == '1') {
									alert(data.message);
									$location.path('/');
								} else if (data.returnCode == '2') {
									alert(data.message);
									$location.path('/');
								}
								$scope.message = data.message;
								alert($scope.message);
								$scope.user = {};
							});

				}
			} ]);
})();
