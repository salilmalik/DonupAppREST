(function() {
  'use strict';

  var app = angular.module('donup');
  app.controller('ChangePasswordCtrl', [ '$scope', '$rootScope', '$cookies',
      'UserService', '$location', controller ]);
  function controller($scope, $rootScope, $cookies, userService, $location) {
    $rootScope.loggedInUserToken = $cookies.get('usertoken');
    $rootScope.loggedInUsername = $cookies.get('username');
    $scope.user = {};
    $scope.user.password = {};
    $scope.changeMyPassword = function() {
      $scope.user.userID = $cookies.get('userId');
      $scope.user.token = $cookies.get('usertoken');
      userService.changeMyPassword($scope.user).success(function(data) {
        if (data.returnCode == '1') {
          alert(data.message);
          $location.path('/');
        } else if (data.returnCode == '2') {
          alert(data.message);
          $location.path('/');
        }
        $scope.user = {};
      });
    }
  }

})();