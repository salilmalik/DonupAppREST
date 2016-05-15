(function() {
  'use strict';
  var app = angular.module('donup');
  app.controller('MultiImageCtrl', [ '$scope','ImageService', '$route','$location','$cookies','$rootScope',
      function($scope,imageService, $route,$location,$cookies,$rootScope) {
            $rootScope.loggedInUserToken=$cookies.get('usertoken');
        $rootScope.loggedInUsername=$cookies.get('username');
          $scope.imageList=[];
          $scope.imgtn='';
           $scope.view='';
           $scope.forum='';
           $scope.htmlcode='';
      for (var i = 0; i <$rootScope.imagesToUpload.length; i++) {
          imageService.getImage($rootScope.imagesToUpload[i]).success(function(data) {
           $scope.imgtn += $location.$$protocol + "://" + $location.$$host + ":" + $location.$$port+data.imgtn.substring(8);
             $scope.view+=$location.$$protocol + "://" + $location.$$host + ":" + $location.$$port+'/displayImage/'+data._id+'\n';
            $scope.forum+='[URL='+ $scope.view+'][IMG]'+ $scope.imgtn+'[/IMG][/URL]';
            $scope.htmlcode+='<a href="'+ $scope.view+'" target="_blank"><img src="'+ $scope.imgtn+'" border="0"></a><br>';
          });
        }
     
       }]);
})();      
         