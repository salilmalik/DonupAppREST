(function () {
    'use strict';
    var app = angular.module('donup');
    app
        .controller(
        'UserCtrl',
        [
            '$scope',
            'UserService',
            '$location',
            '$cookies',
            '$window', '$auth',
            function ($scope, userService, $location, $cookies,
                $window, $auth) {
                // Models
                $scope.user = {};
                $scope.isUserRegistered = false;
                $scope.message;
                $scope.userToken;
                $scope.dataLoading = false;

                $scope.registerUser = function () {
                    $scope.dataLoading = true;
                    userService
                        .registerUser($scope.user)
                        .success(
                        function (data) {
                            if (data.message == 'User created!') {
                                $scope.isUserRegistered = true;
                                alert("Successfully Registered. Please login.");
                                $location.path('/');
                            }
                            $scope.message = data.message;
                            alert($scope.message);
                            $scope.user = {};
                            /* if(data.success===false){
                             $window.location.reload();
                             }*/
                            $scope.dataLoading = false;
                        });
                }

                $scope.loginUser = function () {
                    userService
                        .loginUser($scope.user)
                        .success(
                        function (data) {
                            $scope.dataLoading = true;
                            if (data.success == true) {
                                $cookies
                                    .put(
                                    'usertoken',
                                    data.token);
                                $cookies
                                    .put(
                                    'username',
                                    data.user.username);
                                $cookies
                                    .put(
                                    'userId',
                                    data.user._id);
                                $scope.message = data.message;
                                $scope.dataLoading = false;
                                $location.path('/');
                            }
                            $scope.message = data.message;
                            $scope.user.password = '';
                            $scope.dataLoading = false;
                        });
                }
                $scope.facebookLoginUser = function (provider) {
                    $auth.authenticate(provider).then(function (response) {
                        $cookies
                            .put(
                            'usertoken',
                            response.data.token);
                        $cookies
                            .put(
                            'username',
                            response.data.user.username);
                        $cookies
                            .put(
                            'userId',
                            response.data.user._id);
                        $location.path('/');
                    });

                };
                $scope.googleLoginUser = function (provider) {
                    $auth.authenticate(provider).then(function (response) {
                        console.log('response' + response);
                        console.log('response' + JSON.stringify(response));
                        $location.path('/');
                    });

                };
                function saveUserData(user) {
                    console.log('user' + JSON.stringify(user));
                    UserService.saveUserData(user).success(function (data) {
                        console.log('saveUserData success');
                        console.log('data: ' + JSON.stringify(data));
                        if (data.returnCode == 1) {
                            getUserID(user.email);
                        }
                        $scope.userID = data.objectId;
                        $localstorage.setObject('user', user);
                        $state.go($state.current, {}, {
                            reload: true
                        });
                    }, function (error) {
                        console.log("ERROR" + error);
                    });
                }
                function getUserID(email) {
                    console.log("getUserID");
                    UserService.getUserID(email).success(function (data) {
                        user._id = data.user_id;
                        $localstorage.setObject('user', user);
                    }, function (error) {
                        console.log("EROOR" + error);
                    });
                }
            }]);
    var compareTo = function () {
        return {
            require: "ngModel",
            scope: {
                otherModelValue: "=compareTo"
            },
            link: function (scope, element, attributes, ngModel) {
                ngModel.$validators.compareTo = function (modelValue) {
                    return modelValue === scope.otherModelValue;
                };

                scope.$watch("otherModelValue", function () {
                    ngModel.$validate();
                });
            }
        };
    };

    app.directive("compareTo", compareTo);
})();