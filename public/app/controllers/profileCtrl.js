(function() {
  'use strict';
  var app = angular.module('donup');
  app.controller('ProfileCtrl', [
      '$scope',
      '$rootScope',
      'UserService',
      '$location',
      '$cookies',
      '$routeParams',
      '$route',
      function($scope, $rootScope,userService, $location, $cookies, $routeParams,
          $route) {
          $rootScope.loggedInUserToken=$cookies.get('usertoken');
    $rootScope.loggedInUsername=$cookies.get('username');
        getUser();
        function getUser() {
          $scope.user = {};
          $scope.user.userID = $cookies.get('userId');
          $scope.user.token = $cookies.get('usertoken');
          userService.getUser($scope.user).success(function(data) {
          $scope.user = data;
          $scope.user.points= data.points;

          });
        }
      } ]);
})();
