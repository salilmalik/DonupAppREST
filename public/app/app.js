(function () {
	'use strict';
	var app = angular.module('donup', ['ngRoute', 'ngCookies', 'ngFileUpload', 'satellizer']).config(function ($authProvider) {
		$authProvider.facebook({
			clientId: '1073914582717265',
			url: '/api/user/fb'
		});
	});
})();
