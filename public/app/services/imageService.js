var app = angular.module('donup');
app.factory('ImageService', [ '$http', function($http) {
    return {
        getImage : getImage,
        getUserImages : getUserImages,
        getmultiImage : getmultiImage,
        updatePoints : updatePoints,
        updateUserPoints:updateUserPoints
    };
    function getImage(imageId) {
        return $http({
            method : 'GET',
            url : 'http://54.191.240.213:8080/api/image/' + imageId
        })
    }
    ;
    function getUserImages(userId) {
        return $http({
            method : 'GET',
            url : '/api/image/getUserImages/' + userId
        })
    }
    ;
    function getmultiImage(multiImage) {
        return $http({
            method : 'GET',
            url : '/api/image/multiImage/' + multiImage

        })
    }
    ;
    function updatePoints(imageId) {
        return $http({
            method : 'PUT',
            url : '/api/image/' + imageId

        })
    }
    ;
    function updateUserPoints(userID) {
        return $http({
            method : 'PUT',
            url : '/api/user/' + userID
        })
    }
    ;

    

} ]);