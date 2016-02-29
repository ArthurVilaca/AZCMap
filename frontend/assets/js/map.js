(function(){
  'use strict';
  var app = angular.module('zicaMap', ['uiGmapgoogle-maps']);

  app.controller("MapCtrl", ['$scope', '$window', function($scope, $window) {

    var socket = $window.io();

    $scope.map = { center: { latitude: -19.9304862, longitude: -43.9450135 }, zoom: 13 };

  }]);

})();


