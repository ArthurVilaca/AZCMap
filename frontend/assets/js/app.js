(function(){
  'use strict';
  var app = angular.module('zicaMap', ['uiGmapgoogle-maps', 'ngMaterial']);
  
  //Config the angular google maps to use our key
  app.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyBHdrTrrlUvUOMsU7SdCvZgKEUvutZL4HQ',
        libraries: 'places'
    });
  });
  
  app.run(['$templateCache', function ($templateCache) {
    $templateCache.put('searchbox.tpl.html', '<input ng-model="searchCriteria" ng-class="{ true: \'has-value\' }[searchCriteria && searchCriteria.length > 0]" id="pac-input" class="pac-controls" type="text" placeholder="Pesquisar">');
    $templateCache.put('add-marker-dialog.tpl.html', '<md-dialog aria-label="Adicionar caso" ng-cloak><form name="markerForm"> <md-toolbar><div class="md-toolbar-tools"><h2>Adicionar caso</h2><span flex></span><md-button class="md-icon-button" ng-click="hide()"><i style="font-size: 1.5em;" class="fa fa-times" aria-label="Close dialog"></i></md-button></div></md-toolbar> <md-dialog-content class="new-marker-content"> '+
        '<div layout layout-sm="column"> <md-input-container flex> <input ng-model="marker.userName" md-maxlength="70"placeholder="Seu nome..." required> </md-input-container> </div> '+
        '<div layout layout-sm="column"> <md-input-container flex> <input ng-model="marker.description" md-maxlength="150" placeholder="Comentarios..." required> </md-input-container> </div> </form> '+
        '<div layout-gt-xs="row" >'+
        '<md-radio-group ng-model="marker.type" required>'+
        '<label style="display: block;">Tipo</label>' +
        '<md-radio-button class="type-radio" ng-repeat="case in cases" ng-value="case.id" aria-label="{{case.type}}">{{case.type}}</md-radio-button>'+
        '</md-radio-group></div><div >'+
        '<label style="display: block;">Localização</label>' +
        '<ui-gmap-google-map events="DialogCtrl.mapEvents" class="addMarker" control="map.control" center="map.center" options="DialogCtrl.options" draggable="true" events="map.events" zoom="map.zoom">'+
        '<ui-gmap-search-box template="DialogCtrl.searchbox.template"  options="DialogCtrl.searchbox.options" events="DialogCtrl.searchbox.events" position="DialogCtrl.searchbox.position"></ui-gmap-search-box>' +
        '<ui-gmap-marker coords="marker.location.coordinates" options="marker.options" idKey="1">'+
        '</ui-gmap-marker>'+
        '</ui-gmap-google-map>'+
        '</div>'+
        '</md-dialog-content>' +
        '<md-dialog-actions layout="row"> <md-button ng-click="hide();"> Cancelar </md-button> <md-button ng-click="newMarker();" class="md-primary"> Salvar </md-button> </md-dialog-actions>' +
        '</form></md-dialog>');
  }]);
  
  app.factory('mapDefaultOptions', function mapDefaultOptionsFactory() {
    var leftOptions = {
      position: typeof google !== 'undefined'? google.maps.ControlPosition.BOTTOM_LEFT : 10
    };
    return {
      streetViewControlOptions: leftOptions,
      mapTypeControlOptions: leftOptions,
      zoomControlOptions: leftOptions
    };
  });
  
  app.controller("MapCtrl", ['$scope', '$rootScope', '$window', '$mdSidenav', 'mapDefaultOptions', function($scope, $rootScope, $window, $mdSidenav, mapDefaultOptions) {
    this.options = mapDefaultOptions;

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
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        $rootScope.map.control.refresh({latitude: lat, longitude: lng});
        $rootScope.creatorLocation = {latitude: lat, longitude: lng};
        $rootScope.map.control.getGMap().setCenter(new google.maps.LatLng(lat, lng));
      });
    }

    var socket = $window.io();

    $scope.toggleLeft = function() {
      $mdSidenav('left').toggle();
    };

    $scope.markers = [];
    socket.on('marker:all', function(data) {
      $scope.markers = data.data;
    });

    socket.on('marker:save', function(data) {
      $scope.markers.push(data.data);
    });

}]).controller('StatisticsCtrl', ['$scope', '$mdSidenav', '$mdMedia', function($scope, $mdSidenav, $mdMedia) {
  
  $scope.close = function() {
    $mdSidenav('left').close();
  };
  
  $scope.showCloseButton = function() {
    return !$mdMedia('gt-md');
  };

}]).controller('AddMarkerCtrl', ['$scope', '$window', '$mdMedia', '$mdBottomSheet','$mdSidenav', '$mdDialog', function($scope, $window, $mdMedia, $mdBottomSheet, $mdSidenav, $mdDialog){
    var fullScreenDialog = $mdMedia('xs') || $mdMedia('sm');
    $scope.showAdd = function(ev) {
      $mdDialog.show({
        controller: 'DialogController as DialogCtrl',
        templateUrl: 'add-marker-dialog.tpl.html',
        targetEvent: ev,
        fullscreen: fullScreenDialog
      });
    };
    
    $scope.$watch(function() {
      return $mdMedia('xs') || $mdMedia('sm');
    }, function(wantsFullScreen) {
      fullScreenDialog = (wantsFullScreen === true);
    });

  }]).controller('DialogController', ['$scope', '$mdDialog', '$rootScope', '$http', 'mapDefaultOptions', '$timeout', function($scope, $mdDialog, $rootScope, $http, mapDefaultOptions, $timeout) {
    var self = this;
    
    this.searchbox = {
      template: 'searchbox.tpl.html',
      position: 'top-left',
      events: {
        places_changed: function (searchBox) {
            var places = searchBox.getPlaces();
            for (var i = 0; i < places.length; i++) {
              $scope.marker.location.coordinates = [
                places[i].geometry.location.lng(),
                places[i].geometry.location.lat()
              ];
              
              self.centerMap(places[i].geometry.location.lat(),places[i].geometry.location.lng());
            }            
        }
      }
    };
    
    this.options = angular.copy(mapDefaultOptions);
    this.options.streetViewControl = false;
    var refreshedOnce = false;
    
    this.mapEvents = {
      idle: function (maps, eventName, args) {
        if (!refreshedOnce) {
          self.refreshMap();
          refreshedOnce = true;
        }
      }
    };
    
    this.centerMap = function (latitude, longitude) {
      var lat = latitude || $rootScope.map.center.latitude;
      var lng = longitude || $rootScope.map.center.longitude;
      $rootScope.map.control.getGMap().setCenter(new google.maps.LatLng(lat, lng));
    };
    
    this.refreshMap = function () {
      $scope.map.control.refresh();
      this.centerMap();
    };
    
    $scope.map = { 
      center: { 
        latitude: $rootScope.map.center.latitude, 
        longitude: $rootScope.map.center.longitude 
      }, 
      zoom: 12,
      control: $rootScope.map.control
    };

    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.marker = {
      location: {
        coordinates: [ 
          $rootScope.map.center.longitude,
          $rootScope.map.center.latitude ]
      },
      options: {
        draggable: true
      },
      type: {},
      creatorLocation: {
        coordinates: []
      }
    };

    $scope.newMarker = function () {
      if($scope.markerForm.$valid){
        if($rootScope.creatorLocation !== undefined)
          $scope.marker.creatorLocation.coordinates = [$rootScope.creatorLocation.longitude, $rootScope.creatorLocation.latitude];
        $http.post('/api/marker', $scope.marker);
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
    var customBlueMap =     $mdThemingProvider.extendPalette('blue', {
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
      .accentPalette('blue');
    $mdThemingProvider.theme('input', 'default')
          .primaryPalette('grey');
  });
  
})();
