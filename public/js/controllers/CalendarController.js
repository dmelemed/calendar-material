var app = angular.module('StarterApp');

app.controller('CalendarCtrl', ['$scope', function($scope) {

  const DAYS_PER_WEEK = 7;
  const HOURS_PER_DAY = 24;
  const MINUTES_PER_HOUR = 60;
  const MINUTES_PER_DAY = 24 * 60;

  const DAYS_OF_THE_WEEK = {
    0: "SUNDAY",
    1: "MONDAY",
    2: "TUESDAY",
    3: "WEDNESDAY",
    4: "THURSDAY",
    5: "FRIDAY",
    6: "SATURDAY"
  };

  const EMPTY_ALL_DAY_EVENT = {
    name: "all day event",
    startTime: 0,
    duration: MINUTES_PER_DAY
  };

  $scope.day = [];

  for(var i = 0; i < HOURS_PER_DAY; i++) {
    var hour = {
      index: i,
      hour: i === 0 ? 12 : i,
      period: i < 12 ? "AM" : "PM"
    };
    $scope.day.push(hour);
  }

  $scope.defaultBlocks = [];

  $scope.events = [{
    name: "event",
    startTime: 6 * 60,
    duration: 45
  }];

  /*for(var hour = 0; hour < HOURS_PER_DAY; hour++) {
    for(var minute = 0; block < MINUTES_PER_HOUR; block++) {

      $scope.defaultBlocks.push(span);
    }
  }*/
  var blockStartTime = 0;
  for(var i = 0; i < $scope.events.length; i++) {
    var event = $scope.events[i];

    // create a filler block
    if(blockStartTime < event.startTime) {
      var duration = event.startTime - blockStartTime;
      var emptyBlock = {
        name: "empty",
        startTime: blockStartTime,
        duration: duration
      };
      blockStartTime += duration;
      $scope.defaultBlocks.push(emptyBlock);
    }

    $scope.defaultBlocks.push(event);
    blockStartTime += event.duration;
  }

  // emptyBlock for end of day
  if(blockStartTime !== MINUTES_PER_DAY) {
    var emptyBlock = {
      name: "empty",
      startTime: blockStartTime,
      duration: MINUTES_PER_DAY - blockStartTime
    }
    $scope.defaultBlocks.push(emptyBlock);
  }


  $scope.getEvents = function(day) {
    if(day.index === 1) {
      return [EMPTY_ALL_DAY_EVENT];
    }
    return $scope.defaultBlocks;
  }

  $scope.week = [];
  for(var day = 0; day < DAYS_PER_WEEK; day++) {
    $scope.week.push({
      index: day,
      name: DAYS_OF_THE_WEEK[day]
    });
  }

}]);
