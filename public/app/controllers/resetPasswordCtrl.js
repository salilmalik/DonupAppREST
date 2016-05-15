(function() {
  'use strict';
  var app = angular.module('donup');
  app
      .controller(
          'ResetPasswordCtrl',
          [
              '$scope',
              '$routeParams',
              'UserService',
              '$location',
              function($scope, $routeParams, userService,
                  $location) {
                $scope.user = {};
                $scope.resetMyPassword = function() {
                  $scope.user.resetPasswordToken = $routeParams.param;
                  userService
                      .resetPassword($scope.user)
                      .success(
                          function(data) {
                            if (data.returnCode == '1') {
                              alert("Not a valid link or the link has expired");
                              $location.path('/');
                            } else if (data.returnCode == '1') {
                              alert("The password has been reset. Please login.");
                              $location.path('/');
                            }
                            $scope.message = data.message;
                            alert($scope.message);
                            $scope.user = {};
                          });
                }
              } ]);
})();