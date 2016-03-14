var app = angular.module('StarterApp');

app.controller('SidenavCtrl', ['$scope', function($scope) {

  $scope.sidenavOpen = true;

  $scope.close = function() {
    $scope.sidenavOpen = false;
  };

  $scope.moment = moment().day(-1);

}]);
