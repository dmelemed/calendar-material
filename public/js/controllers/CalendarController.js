var app = angular.module('StarterApp');

app.controller('CalendarCtrl', ['$scope', '$http', function($scope, $http) {

  $scope.date = new Date();

  $scope.master = {};

  $scope.items = {};

  $scope.update = function() {
    console.log('update');
    $http.get('api/events').success(function(events) {
      $scope.items = events;
    }).error(function() {
      console.log('error on getting items');
    });
  };

  $scope.submit = function(date) {
    $http.post('api/add', { "startDateTime": date.getTime(), "endDateTime": date.getTime() }).success(function(response) {
      console.log(response);
    }).error(function() {
      console.log('error on creating event');
    });
  };

  function pad(n) {
    return n < 10 ? '0' + n : n
  }

  function ISODateString(d) {
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds())
  }

  $scope.reset = function() {
    $scope.user = angular.copy($scope.master);
  };

  $scope.reset();

}]);
