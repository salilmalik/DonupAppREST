(function() {
	'use strict';

	var app = angular.module('donup');
	app.controller('HeaderCtrl', [ '$scope', '$cookies', '$rootScope',
			controller ]);
	function controller($scope, $cookies, $rootScope) {
		if($cookies.get('userId')===undefined){
		$rootScope.loggedInUsername = $cookies.put('username', undefined);
		$rootScope.loggedInUserToken = $cookies.put('usertoken', undefined);
	}
	 $scope.isCollapsed = true;
    $scope.$on('$routeChangeSuccess', function () {
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