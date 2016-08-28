(function() {
  'use strict';
  var app = angular.module('donup');
  app.controller('ImageLinksCtrl', [ '$scope','$rootScope','$routeParams','$cookies','ImageService', '$route','$location',
      function($scope, $rootScope, $routeParams,$cookies,imageService, $route,$location) {
        console.log('$routeParams.param'+$routeParams.param);
          $rootScope.loggedInUserToken=$cookies.get('usertoken');
        $rootScope.loggedInUsername=$cookies.get('username');
          $scope.dataLoading = true;
            imageService.getImage($routeParams.param).success(function(data) {
            $scope.image = data;
           //$scope.img = $location.$$protocol + "://" + $location.$$host + ":" + $location.$$port+$scope.image.img.substring(8);
            $scope.imgtn = $location.$$protocol + "://" + $location.$$host + ":" + $location.$$port+$scope.image.imgtn.substring(8);
            $scope.view=$location.$$protocol + "://" + $location.$$host + ":" + $location.$$port+'/displayImage/'+$routeParams.param;
            $scope.forum='[URL='+ $scope.view+'][IMG]'+ $scope.imgtn+'[/IMG][/URL]';
            $scope.htmlcode='<a href="'+ $scope.view+'" target="_blank"><img src="'+ $scope.imgtn+'" border="0"></a><br>';
  
            });
        }
       ]);
})();

