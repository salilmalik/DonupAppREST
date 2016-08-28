(function() {
	'use strict';

	var app = angular.module('donup');
	app.controller('HeaderCtrl', [ '$scope', '$cookies', '$rootScope',
			'$location', controller ]);
	function controller($scope, $cookies, $rootScope, $location) {
		$scope.showHeader=true;
		console.log('HeaderCtrl'+$location.path().indexOf('displayAppImage'));
		if ($cookies.get('userId') === undefined) {
			$rootScope.loggedInUsername = $cookies.put('username', undefined);
			$rootScope.loggedInUserToken = $cookies.put('usertoken', undefined);
		}
		if ($location.path().indexOf('displayAppImage') > -1) {
			console.log('showHeader');
			$scope.showHeader = false;
		}
		/*
		 * $scope.displayAppImage=''; console.log("$scope.displayAppImage
		 * "+$scope.displayAppImage); console.log("$scope.displayAppImage
		 * "+$rootScope.displayAppImage);
		 * $scope.displayAppImage=$rootScope.displayAppImage;
		 * console.log("$scope.displayAppImage "+$scope.displayAppImage);
		 */
		$scope.isCollapsed = true;
		$scope.$on('$routeChangeSuccess', function() {
			$scope.isCollapsed = true;
		});
		$scope.logoutUser = function() {
			$cookies.put('username', undefined);
			$cookies.put('username', undefined);
			$cookies.put('userId', undefined);
			$rootScope.loggedInUsername = undefined;
			$rootScope.loggedInUserToken = undefined;
		}
	}
})();