(function(){
  'use strict';
  var app = angular.module('zicaMap', ['uiGmapgoogle-maps']);
  
  //Config the angular google maps to use our key
  app.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyBHdrTrrlUvUOMsU7SdCvZgKEUvutZL4HQ'
    });
  });
  
  app.controller("MapCtrl", ['$scope', '$window', function($scope, $window) {
    this.options = {
      streetViewControl: false,
      mapTypeControlOptions: {
        position: 10
      }
    };
    
    var socket = $window.io();
    
    $scope.map = { center: { latitude: -19.9304862, longitude: -43.9450135 }, zoom: 13 };

  }]);

})();


