(function(){
'use strict';

var app = angular.module('donup');
app.controller('LandingCtrl',['$scope','$cookies','$rootScope',controller]);
function controller($scope,$cookies,$rootScope){
    $rootScope.loggedInUsername = $cookies.get('username');
    $rootScope.loggedInUserToken = $cookies.get('usertoken');
}

})();
