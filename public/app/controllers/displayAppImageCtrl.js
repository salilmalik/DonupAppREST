(function () {
  'use strict';
  var app = angular.module('donup');
  app.controller('DisplayAppImageCtrl', [
    '$scope',
    'ImageService',
    '$routeParams',
    function ($scope, imageService, $routeParams) {
      $scope.image = '';
      displayImage();
      function displayImage() {
        $scope.dataLoading = true;
        imageService.getImage($routeParams.param).success(
          function (data) {
            console.log("data" + JSON.stringify(data));
            $scope.image = data;
            $scope.img = $scope.image.img.substring(8);
            $scope.imgtn = $scope.image.imgtn.substring(8);
          });
      }
      $scope.doThis = function () {
        imageService.updatePoints($routeParams.param).success(
          function (data) {
          });
        if ($scope.image.userId != 'undefined') {
          imageService.updateUserPoints($scope.image.userId).success(
            function (data) {
            });
        }
      }
    }]);
  app.directive('imageonload', ['ImageService',
    function (imageService) {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          element.bind('load', function () {
            scope.$apply(attrs.imageonload);
          });

        }
      };
    }]);
})();
