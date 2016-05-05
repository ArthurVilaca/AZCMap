(function(){
  'use strict';
  var app = angular.module('zicaMap', ['uiGmapgoogle-maps', 'ngMaterial', 'infinite-scroll']);
  
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
        '<div layout layout-sm="column"> <md-input-container flex> <input ng-model="marker.description" md-maxlength="150" placeholder="Comentarios..."> </md-input-container> </div> </form> '+
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
  
  app.filter('orderObjectBy', function() {
    return function(items, itemsToFilter, field, dateField, reverse) {
      var filtered = [];
      itemsToFilter.sort(function (a, b) {
        return ((dateField? (new Date(a[field]) > new Date(b[field])) : a[field] > b[field]) ? 1 : -1);
      });
      if(reverse) itemsToFilter.reverse();
      
      for (var i = 0; i < itemsToFilter.length; i++) {
        if (items[itemsToFilter[i]._id]) {
          filtered.push(itemsToFilter[i]);
        }
      }
      
      return filtered;
    };
  });

  
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
  
  function MarkerDrawer(uiGmapIsReady, $timeout) {
    var self = this;
    this.mapMarkers = [];
    
    uiGmapIsReady.promise(1).then(function(instances) {
      if (instances && instances.length > 0) {
        var instance = instances[0];
        
        self.map = instance.map;
      }
    });
    
    this._addMarker = function (marker, visible) {
      var markerToAdd = new google.maps.Marker({
        position: {lat: marker.location.coordinates[1], lng: marker.location.coordinates[0]},
        map: visible? self.map : null
      });
      markerToAdd._id = marker._id;
      self.mapMarkers.push(markerToAdd);
    };
    
    this.addMarker = function (marker, visible) {
      if (google) {
        self._addMarker(marker, visible);
      } else {
        $timeout(function() {
          self._addMarker(marker, visible);
        }, 1000);
      }
      
      
    };
    
    this.showMarker = function (marker) {
      marker.setMap(self.map);
    };
    
    this.hideMarker = function (marker) {
      marker.setMap(null);
    };
    
    this.updateView = function () {
      if (self.map) {
        var bounds = self.map.getBounds();
        
        for (var i =0; i < self.mapMarkers.length; i++) {
          var marker = self.mapMarkers[i];
          var markerPosition = marker.getPosition();
          if (bounds.contains(markerPosition) && marker.getMap() === null) {
            self.showMarker(marker);
          } else if (!bounds.contains(markerPosition)) {
            self.hideMarker(marker);
          }
        }
      }
    };
  }
  
  app.factory('markerDrawer', ['uiGmapIsReady', '$timeout', function (uiGmapIsReady, $timeout) {
    return new MarkerDrawer(uiGmapIsReady, $timeout);
  }]);
  
  app.controller("MapCtrl", ['$scope', '$rootScope', '$window', '$mdSidenav', 'mapDefaultOptions', 'uiGmapIsReady', 'markerDrawer', function($scope, $rootScope, $window, $mdSidenav, mapDefaultOptions, uiGmapIsReady, markerDrawer) {
    this.options = mapDefaultOptions;
    var self = this;
    $scope.timelineMarkers = [];
    
    this.mapEvents = {
      idle: function (maps, eventName, args) {
        markerDrawer.updateView();
      }
    };

    $rootScope.map = { 
      center: { 
        latitude: -19.9304862, 
        longitude: -43.9450135 
      }, 
      zoom: 13,
      control: {}
    };
    
    this.refreshAndCenter = function(lat, lng) {
      $rootScope.map.control.refresh({latitude: lat, longitude: lng});
      $rootScope.map.control.getGMap().setCenter(new google.maps.LatLng(lat, lng));
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        $rootScope.creatorLocation = {latitude: lat, longitude: lng};
        
        if ($rootScope.map && $rootScope.map.control.refresh) {
          self.refreshAndCenter(lat, lng);
        } else {
           uiGmapIsReady.promise(1).then(function(instances) {
            if (instances && instances.length > 0) {
              self.refreshAndCenter(lat, lng);
            }
          });
        }
      });
    }

    var socket = $window.io();

    $scope.toggleLeft = function() {
      $mdSidenav('left').toggle();
    };

    $scope.markers = [];
    //TODO: Change to get request
    socket.on('marker:all', function(event) {
      $scope.$apply(function () {
        $scope.markers = event.data;
        for (var i = 0; i < $scope.markers.length; i++) {
          markerDrawer.addMarker($scope.markers[i]);
          
          if (i <= 20 && $scope.timelineMarkers.length === 0) {
            $scope.timelineMarkers.push($scope.markers[i]);
          }
        }
        markerDrawer.updateView();
      });
    });
    
    socket.on('marker:save', function(event) {
      $scope.$apply(function pushMarker() {
        $scope.markers.push(event.data);
        $scope.timelineMarkers.push(event.data);
        markerDrawer.addMarker(event.data, true);
      });
    });
    
    $scope.loadMoreTimelineItems = function () {
      var numberOfItems = $scope.timelineMarkers.length;
      for (var i = numberOfItems; (i < (numberOfItems + 9) && i < $scope.markers.length); i++) {
        $scope.timelineMarkers.push($scope.markers[i]);
        
      }
    };
}]).controller('StatisticsCtrl', ['$scope', '$mdSidenav', '$mdMedia', '$window', function($scope, $mdSidenav, $mdMedia, $window) {
  
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

  }]).controller('DialogController', ['$scope', '$mdDialog', '$rootScope', '$http', 'mapDefaultOptions', '$timeout', '$mdToast', function($scope, $mdDialog, $rootScope, $http, mapDefaultOptions, $timeout, $mdToast) {
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
          if ($scope.map && $scope.map.control && $scope.map.control.refresh) {
            self.refreshMap();
            refreshedOnce = true;
          }
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
      type: 1,
      creatorLocation: {
        coordinates: []
      }
    };

    $scope.newMarker = function () {
      if($scope.markerForm.$valid){
        if($rootScope.creatorLocation !== undefined)
          $scope.marker.creatorLocation.coordinates = [$rootScope.creatorLocation.longitude, $rootScope.creatorLocation.latitude];
        $http.post('/api/marker', $scope.marker)
          .then(function (response) {
            showToast('top right', 'Caso salvo com sucesso!', 'success', 1500);
            $scope.hide();
          }, function (response) {
            showToast('top right', response.data.error.message, 'error', 1500);
          });
      }
    };
    
    function showToast(position, message, toastClass, hideDelay) {
      $mdToast.show({
        template: '<md-toast class="' + toastClass + '">' + message + '</md-toast>',
        position: position,
        hideDelay: hideDelay || 1500
      });
    }

    $scope.cases = [
    { type: "Foco do mosquisto", id: 1 },
    { type: "Caso de zica", id: 2 },
    { type: "Caso de Dengue", id: 3 },
    { type: "Caso de Chikungunya", id: 4 }];
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
