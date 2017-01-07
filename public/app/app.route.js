(function () {
    'use strict';
    var app = angular.module('donup');
    app.config(function ($httpProvider, $routeProvider, $locationProvider) {

        // attach our auth interceptor to the http requests
        $httpProvider.interceptors.push('AuthInterceptor');

        $routeProvider.when('/wall', {
            controller: 'WallCtrl',
            templateUrl: 'app/views/wall.html'
        }).when('/', {
            controller: 'LandingCtrl',
            templateUrl: 'app/views/landing.html'
        })
            // home page route
            .when('/upload', {
                controller: 'UploadCtrl',
                templateUrl: 'app/views/upload.html'
            })
            // User login & Register
            .when('/login', {
                controller: 'UserCtrl',
                templateUrl: 'app/views/login.html'
            }).when('/register', {
                controller: 'UserCtrl',
                templateUrl: 'app/views/register.html'
            }).when('/forgotPassword/', {
                controller: 'ForgotPasswordCtrl',
                templateUrl: 'app/views/forgotPassword.html'
            }).when('/resetPassword/:param', {
                controller: 'ResetPasswordCtrl',
                templateUrl: 'app/views/resetPassword.html'
            }).when('/profile', {
                controller: 'ProfileCtrl',
                templateUrl: 'app/views/profile.html'
            }).when('/', {
                controller: 'LandingCtrl',
                templateUrl: 'app/views/landing.html'
            }).when('/aboutUs', {
                templateUrl: 'app/views/aboutUs.html'
            }).when('/faq', {
                templateUrl: 'app/views/faq.html'
            }).when('/terms', {
                templateUrl: 'app/views/terms.html'
            }).when('/contactUs', {
                templateUrl: 'app/views/contactUs.html'
            }).when('/confirmEmailLink/:param', {
                controller: 'ConfirmEmailLinkCtrl',
                templateUrl: 'app/views/confirmEmailLink.html'
            }).when('/displayImage/:param', {
                controller: 'DisplayImageCtrl',
                templateUrl: 'app/views/displayImage.html',
                resolve: {
                    // I will cause a 1 second delay
                    delay: function ($q, $timeout) {
                        var delay = $q.defer();
                        $timeout(delay.resolve, 1000);
                        return delay.promise;
                    }
                }
            }).when('/displayAppImage/:param', {
                controller: 'DisplayAppImageCtrl',
                templateUrl: 'app/views/displayAppImage.html',
                resolve: {
                    // I will cause a 1 second delay
                    delay: function ($q, $timeout) {
                        var delay = $q.defer();
                        $timeout(delay.resolve, 1000);
                        return delay.promise;
                    }
                }
            }).when('/changePassword', {
                controller: 'ChangePasswordCtrl',
                templateUrl: 'app/views/changePassword.html'
            }).when('/multiImage', {
                controller: 'MultiImageCtrl',
                templateUrl: 'app/views/multiImage.html',
                resolve: {
                    // I will cause a 1 second delay
                    delay: function ($q, $timeout) {
                        var delay = $q.defer();
                        $timeout(delay.resolve, 1000);
                        return delay.promise;
                    }
                }
            }).when('/imageLinks/:param', {
                controller: 'ImageLinksCtrl',
                templateUrl: 'app/views/imageLinks.html',

            }).when('/report', {
                controller: 'ReportCtrl',
                templateUrl: 'app/views/report.html'
            })
            ;

        // get rid of the hash in the URL
        $locationProvider.html5Mode(true);
    });

})();
