(function () {
    'use strict';
    var app = angular.module('donup');
    app
        .controller(
        'ReportCtrl',
        [
            '$scope',
            '$location', 'ImageService',
            function ($scope,
                $location, imageService) {
                $scope.reportImage = function (image) {
                    imageService.reportImage(image).success(function (data) {
                        if (data.returnCode === 0) {
                            alert(data.message);
                            $location.path('/');
                        };
                    });
                }
            }]);
})();