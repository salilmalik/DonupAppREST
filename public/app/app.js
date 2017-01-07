(function () {
	'use strict';
	var app = angular.module('donup', ['ngRoute', 'ngCookies', 'ngFileUpload', 'satellizer']).config(function ($authProvider) {
		$authProvider.facebook({
			clientId: '1073914582717265',
			url: '/api/user/fb'
		});
		$authProvider.google({
			clientId: '311248885229-ntbj2ddju470c5a2getl5llbp4irlm5a.apps.googleusercontent.com',
			url: '/api/user/google'
		});
	});
})();
