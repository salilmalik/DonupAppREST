var app = angular.module('donup');
app.factory('UserService', ['$http', function ($http) {
    return {
        registerUser: registerUser,
        loginUser: loginUser,
        forgotPassword: forgotPassword,
        resetPassword: resetPassword,
        confirmEmailLink: confirmEmailLink,
        getUser: getUser,
        changeMyPassword: changeMyPassword
    };

    function registerUser(user) {
        return $http({
            method: 'POST',
            url: '/api/user/register',
            data: user
        })
    }
    ;

    function loginUser(user) {
        return $http({
            method: 'POST',
            url: '/api/user/login',
            data: user
        })
    }
    ;

    function forgotPassword(user) {
        return $http({
            method: 'POST',
            url: '/api/user/forgotPassword',
            data: user
        })
    }
    ;

    function resetPassword(user) {
        return $http({
            method: 'POST',
            url: '/api/user/resetPassword',
            data: user
        })
    }
    ;

    function confirmEmailLink(user) {
        return $http({
            method: 'POST',
            url: '/api/user/confirmEmailLinks',
            data: user
        })
    }
    ;

    function getUser(user) {
        return $http({
            method: 'GET',
            url: '/api/user/' + user.userID,
            headers: {
                'x-access-token': user.token
            }
        })
    }
    ;

    function changeMyPassword(user) {
        return $http({
            method: 'POST',
            url: '/api/user/changePassword',
            data: user,
            headers: {
                'x-access-token': user.token
            }
        })
    }
    ;



}]);