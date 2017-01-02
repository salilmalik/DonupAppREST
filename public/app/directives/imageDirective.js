(function () {
    var app = angular.module('donup');
    app.directive('imageUpload', function ($rootScope) {
        return {
            restrict: 'A',
            templateUrl: 'app/directives/imageUpload.html',
            scope: {
                files: '=',
                watermarkText: '='
            },
            controller: ['$scope', 'Upload', '$timeout', 'ImageService', '$cookies', '$location', function ($scope, Upload, $timeout, imageService, $cookies, $location) {

                $scope.images = {};
                $scope.userId = $cookies.get('userId');
                console.log('IMAGE UPLAOD ' + $scope.userId);
                $scope.imagesToUpload = [];
                $scope.$watch('files', function () {
                    $scope.upload($scope.files);
                });
                $scope.upload = function (files) {
                    if (files && files.length) {
                        for (var i = 0; i < files.length; i++) {
                            var file = files[i];
                            Upload.upload({
                                url: 'api/image',
                                fields: { 'userId': $scope.userId, 'watermarkText': $scope.watermarkText },
                                file: file
                            }).progress(function (evt) {
                                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                                $scope.progress = progressPercentage;
                            }).success(function (data, status, headers, config) {
                                $scope.imagesToUpload.push(data.imageId);
                                console.log(JSON.stringify(data));
                                if (i == 1) {
                                    $location.path("/imageLinks/" + data.imageId);
                                } else {
                                    $rootScope.imagesToUpload = $scope.imagesToUpload;
                                    $location.path("/multiImage");
                                }
                            }).error(function (data, status, headers, config) {
                                console.log('error status: ' + status);
                            })
                        }
                    }
                };

            }]
        };
    });
    app.directive('selectOnClick', ['$window', function ($window) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.on('click', function () {
                    if (!$window.getSelection().toString()) {
                        // Required for mobile Safari
                        this.setSelectionRange(0, this.value.length)
                    }
                });
            }
        };
    }]);
})();