(function () {
	'use strict';
	var app = angular.module('donup', ['ngRoute', 'ngCookies', 'ngFileUpload', 'satellizer']).config(function ($authProvider) {
		$authProvider.facebook({
			clientId: '1228445853873951',
			url: '/api/user/fb'
		});
	});
})();
