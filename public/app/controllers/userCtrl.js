(function() {
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
              '$window',
              function($scope, userService, $location, $cookies,
                  $window) {
                // Models
                $scope.user = {};
                $scope.isUserRegistered = false;
                $scope.message;
                $scope.userToken;
                $scope.dataLoading = false;

                $scope.registerUser = function() {
                  $scope.dataLoading = true;
                  userService
                      .registerUser($scope.user)
                      .success(
                          function(data) {
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

                $scope.loginUser = function() {
                  userService
                      .loginUser($scope.user)
                      .success(
                          function(data) {
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

              } ]);
 var compareTo = function() {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function(scope, element, attributes, ngModel) {
            ngModel.$validators.compareTo = function(modelValue) {
                return modelValue === scope.otherModelValue;
            };
 
            scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }
    };
};
 
app.directive("compareTo", compareTo);
})();