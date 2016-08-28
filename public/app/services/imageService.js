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
            url : 'http://192.168.0.104:8080/api/image/' + imageId
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
    function updateUserPoints(userEmail) {
        return $http({
            method : 'PUT',
            url : '/api/user/updatePoints/' + userEmail
        })
    }
    ;

    

} ]);