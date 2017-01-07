var app = angular.module('donup');
app.factory('ImageService', ['$http', function ($http) {
    return {
        getImage: getImage,
        getUserImages: getUserImages,
        getmultiImage: getmultiImage,
        updatePoints: updatePoints,
        updateUserPoints: updateUserPoints,
        reportImage: reportImage
    };
    function getImage(imageId) {
        return $http({
            method: 'GET',
            url: '/api/image/' + imageId
        })
    }
    ;
    function getUserImages(userId) {
        return $http({
            method: 'GET',
            url: '/api/image/getUserImages/' + userId
        })
    }
    ;
    function getmultiImage(multiImage) {
        return $http({
            method: 'GET',
            url: '/api/image/multiImage/' + multiImage

        })
    }
    ;
    function updatePoints(imageId) {
        return $http({
            method: 'PUT',
            url: '/api/image/' + imageId

        })
    }
    ;
    function updateUserPoints(userID) {
        return $http({
            method: 'PUT',
            url: '/api/user/updatePoints/' + userID
        })
    }
    ;
    function reportImage(image) {
        return $http({
            method: 'POST',
            url: '/api/image/reportImage',
            data: image
        })
    }
}]);