(function(){
  'use strict';
  var app = angular.module('zicaMap', ['uiGmapgoogle-maps', 'ngMaterial']);
  
  //Config the angular google maps to use our key
  app.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyBHdrTrrlUvUOMsU7SdCvZgKEUvutZL4HQ'
    });
  });
  
  app.controller("MapCtrl", ['$scope', '$rootScope', '$window', '$mdSidenav', function($scope, $rootScope, $window, $mdSidenav) {
    this.options = {
      streetViewControl: false,
      mapTypeControlOptions: {
        position: 10
      },
        zoomControl: false
    };

    $rootScope.map = { 
      center: { 
        latitude: -19.9304862, 
        longitude: -43.9450135 
      }, 
      zoom: 13,
      control: {}
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        $rootScope.map.control.refresh({latitude: position.coords.latitude, longitude: position.coords.longitude});
      });
    }

    var socket = $window.io();

    $scope.toggleLeft = function() {
      $mdSidenav('left').toggle();
    };

    $scope.markers = [];
    socket.on('marker:all', function(data) {
      $scope.markers = data;
    });

    socket.on('marker:new', function(data) {
      $scope.markers.push(data);
    });

}]).controller('StatisticsCtrl', function($scope, $mdSidenav) {
  
  $scope.close = function() {
    $mdSidenav('left').close();
  };

}).controller('AddMarkerCtrl', ['$scope', '$window', '$mdBottomSheet','$mdSidenav', '$mdDialog', function($scope, $window, $mdBottomSheet, $mdSidenav, $mdDialog){
 
    $scope.showAdd = function(ev) {
      $mdDialog.show({
        controller: 'DialogController',
        template: '<md-dialog aria-label="Mango (Fruit)" class="md-padding bidi" ng-cloak><md-content> <form name="markerForm"> '+
        '<div layout layout-sm="column"> <md-input-container flex> <input ng-model="user.name" md-maxlength="70"placeholder="Seu nome..." required> </md-input-container> </div> '+
        '<div layout layout-sm="column"> <md-input-container flex> <input ng-model="user.comments" md-maxlength="150" placeholder="Comentarios..." required> </md-input-container> </div> </form> '+
        '<div layout-gt-xs="row" >'+
        '<md-radio-group ng-model="marker.type" required>'+
        '<md-radio-button class="type-radio" ng-repeat="case in cases" ng-value="case.id" aria-label="{{case.type}}">{{case.type}}</md-radio-button>'+
        '</md-radio-group></div><div ng-show="refreshMap();" style="height: 400px;">'+
        '<ui-gmap-google-map class="addMarker" control="map.control" center="map.center" options="options" draggable="true" events="map.events" zoom="map.zoom">'+
        '<ui-gmap-marker coords="marker.coords" options="marker.options" idKey="1">'+
        '</ui-gmap-marker>'+
        '</ui-gmap-google-map>'+
        '</div>'+
        '<div layout-gt-xs="row" class="md-actions" layout="row">'+
        '<md-button ng-click="hide();"> Cancelar </md-button> '+
        '<md-button ng-click="newMarker();" class="md-primary"> Salvar </md-button> </div></form></md-content></md-dialog>',
        targetEvent: ev
      });
    };

  }]).controller('DialogController', ['$scope', '$window', '$mdBottomSheet','$mdSidenav', '$mdDialog', '$rootScope', function($scope, $window, $mdBottomSheet, $mdSidenav, $mdDialog, $rootScope){

    this.options = {
      streetViewControl: false,
      mapTypeControlOptions: {
        position: 10
      },
      zoomControl: false
    };

    $scope.map = { 
      center: { 
        latitude: $rootScope.map.center.latitude, 
        longitude: $rootScope.map.center.longitude 
      }, 
      zoom: 12,
      control: $rootScope.map.control
    };

    var socket = $window.io();

    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.marker = {
      coords: { 
      latitude: $rootScope.map.center.latitude,
      longitude: $rootScope.map.center.longitude
      },
      options: {
        draggable: true
      },
      type: {}
    };

    $scope.refreshMap = function () {
      $scope.map.control.refresh();
      return true;
    }

    $scope.newMarker = function () {
      if($scope.markerForm.$valid){
        socket.emit('new Marker', { marker: $scope.marker});
        $scope.hide();
      }
    };

    $scope.cases = [
    { type: "Foco do mosquisto", id: 1 },
    { type: "Caso de zica", id: 2 },
    { type: "Caso de Dengue",id: 3 },
    { type: "Caso de Chicungunha", id: 4 }];

}]);

  app.config(function($mdThemingProvider) {
    var customBlueMap =     $mdThemingProvider.extendPalette('red', {
      'contrastDefaultColor': 'light',
      'contrastDarkColors': ['50'],
      '50': 'ffffff'
    });
    $mdThemingProvider.definePalette('neonRed', customBlueMap);
    $mdThemingProvider.theme('default')
      .primaryPalette('neonRed', {
        'default': '500',
        'hue-1': '50'
      })
      .accentPalette('red');
    $mdThemingProvider.theme('input', 'default')
          .primaryPalette('grey');
  });
  
})();
