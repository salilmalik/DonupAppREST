(function () {
  'use strict';
  var app = angular.module('donup');
  app.controller('DisplayImageCtrl', [
    '$scope',
    'ImageService',
    '$location',
    '$routeParams',
    '$route',
    '$cookies',
    '$rootScope',
    function ($scope, imageService, $location, $routeParams, $route,
      $cookies, $rootScope) {
      $rootScope.loggedInUserToken = $cookies.get('usertoken');
      $rootScope.loggedInUsername = $cookies.get('username');
      $scope.image = '';
      displayImage();
      function displayImage() {
        $scope.dataLoading = true;
        imageService.getImage($routeParams.param).success(
          function (data) {
            $scope.image = data;
            console.log('$scope.image' + $scope.image);
            $scope.img = $scope.image.img.substring(8);
            $scope.imgtn = $scope.image.imgtn.substring(8);
          });
      }
      $scope.doThis = function () {
        imageService.updatePoints($routeParams.param).success(
          function (data) {
          });
        if ($scope.image.userID !== 'undefined') {
          imageService.updateUserPoints($scope.image.userID).success(
            function (data) {
            });
        }
      }
    }]);
  app.directive('imageonload', ['$route',
    function ($route) {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          element.bind('load', function () {
          });
        }
      };
    }]);
})();
