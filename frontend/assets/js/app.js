(function(){
  'use strict';
  
  Highcharts.setOptions({
      colors: [ '#2979FF', '#2B9AF2', '#EE5555', '#448AFF']
  });
  
  var app = angular.module('zicaMap', ['uiGmapgoogle-maps', 'ngMaterial', 'infinite-scroll', 'highcharts-ng']);
  
  var MARKER_TYPES = {
    'Focus point': 1,
    'Zika case': 2,
    'Dengue case': 3,
    'Chikungunya case': 4
  };
  
  var FOCUS_POINT_LABEL = 'Foco do mosquito';
  var ZIKA_LABEL = 'Zika';
  var DENGUE_LABEL = 'Dengue';
  var CHIKUNGUNYA_LABEL = 'Chikungunya';
  
  //Config the angular google maps to use our key
  app.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyBHdrTrrlUvUOMsU7SdCvZgKEUvutZL4HQ',
        libraries: 'places'
    });
    
    //ChartJsProvider.setOptions({ colours : [ '#2979FF', '#2B9AF2', '#EE5555', '#448AFF'] });
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
  
  function MarkerDrawer(uiGmapIsReady, requestService, $timeout) {
    
    var markerImages;
  
    function createMarkerImages() {
      markerImages = {
        1: requestService.getRealUrl('assets/img/marker_foco.png'),
        2: requestService.getRealUrl('assets/img/marker_zika.png'),
        3: requestService.getRealUrl('assets/img/marker_dengue.png'),
        4: requestService.getRealUrl('assets/img/marker_chikungunya.png')
      };
    }
  
    function getMarkerImageByType(type) {
      return markerImages[type];
    }
  
    var self = this;
    this.mapMarkers = [];
    var mapReadyPromise = uiGmapIsReady.promise(1);
    mapReadyPromise.then(function(instances) {
      if (instances && instances.length > 0) {
        var instance = instances[0];
        
        self.map = instance.map;
      }
    });
    
    this._addMarker = function (marker, visible) {
      var markerToAdd = new google.maps.Marker({
        position: {lat: marker.location.coordinates[1], lng: marker.location.coordinates[0]},
        map: visible? self.map : null,
        icon: getMarkerImageByType(marker.type)
      });
      markerToAdd._id = marker._id;
      self.mapMarkers.push(markerToAdd);
    };
    
    this.addMarker = function (marker, visible) {
      mapReadyPromise.then(function () {
        if (!markerImages) {
          createMarkerImages();
        }
        self._addMarker(marker, visible);
      });
    };
    
    this.showMarker = function (marker) {
      marker.setMap(self.map);
    };
    
    this.hideMarker = function (marker) {
      marker.setMap(null);
    };
    
    this.updateView = function () {
      mapReadyPromise.then(function () {
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
      });
    };
  }
  
  function RequestService($http) {
    var serviceUrl = 'http://azcmap.bitnamiapp.com';
    
    this.setServiceUrl = function setServiceUrl(url) {
      if (url) {
        serviceUrl = url;
      }
    };
    this.getServiceUrl = function getServiceUrl() {
      return serviceUrl;
    };
    
    this.getRealUrl = function getRealUrl(url) {
      return serviceUrl + (url[0] === '/'? '' : '/') + url;
    };
    
    this.get = function get() {
      var service = arguments[0];
      arguments[0] = this.getRealUrl(service);
      return $http.get.apply($http, arguments);
    };
  }
  
  app.service('requestService', ['$http', function ($http) {
    return new RequestService($http);
  }]);
  
  app.service('markerDrawer', ['uiGmapIsReady', 'requestService', '$timeout', function (uiGmapIsReady, requestService, $timeout) {
    return new MarkerDrawer(uiGmapIsReady, requestService, $timeout);
  }]);
  
  app.controller("MapCtrl", ['$scope', '$rootScope', '$window', '$mdSidenav', 'mapDefaultOptions', 'uiGmapIsReady', 'markerDrawer', '$http', 'requestService', function($scope, $rootScope, $window, $mdSidenav, mapDefaultOptions, uiGmapIsReady, markerDrawer, $http, requestService) {
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
    
    $scope.panToMarker = function (marker) {
      $scope.map.control.getGMap().panTo({lat: marker.location.coordinates[1], lng: marker.location.coordinates[0]});
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
    requestService.get('/api/marker/all').then(function (response) {
      $scope.markers = response.data.markers;
      for (var i = 0; i < $scope.markers.length; i++) {
        markerDrawer.addMarker($scope.markers[i]);
        
        if (i <= 20 && $scope.timelineMarkers.length === 0) {
          $scope.timelineMarkers.push($scope.markers[i]);
        }
      }
      markerDrawer.updateView();
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
}]).controller('StatisticsCtrl', ['$scope', '$mdSidenav', '$mdMedia', '$window', 'requestService', function($scope, $mdSidenav, $mdMedia, $window, requestService) {
  $scope.activeTab = 'timeline';
  $scope.lastMonthsMarkersCount = 0;
  $scope.neighbourhoodsByCity = [];
  $scope.casesByNeighbourhood = [[]];
  
  var caseIcons = {
    1: requestService.getRealUrl('assets/img/icon_foco.png'),
    2: requestService.getRealUrl('assets/img/icon_zika.png'),
    3: requestService.getRealUrl('assets/img/icon_dengue.png'),
    4: requestService.getRealUrl('assets/img/icon_chikungunya.png')
  };
  
  this.getCaseIconFromMarkerType = function getCaseIconFromMarkerType(type) {
    return caseIcons[type];
  };
  
  var casesTypeColorMap = {};
  casesTypeColorMap[FOCUS_POINT_LABEL] = '#96F7BA';
  casesTypeColorMap[CHIKUNGUNYA_LABEL] = '#D9D075';
  casesTypeColorMap[DENGUE_LABEL] = '#CA3838';
  casesTypeColorMap[ZIKA_LABEL] = '#6390DB';
  
  $scope.casesTypeConfig = {
    options: {
      chart: {
        type: 'pie'
      }
    },
    xAxis: {
      labels: {
        enabled: true,
        formatter: function getLabelFromValue() {
          return $scope.casesTypeConfig.series[0].data[this.value].name;
        }
      }
    },
    series: [{
      data: [],
      tooltip: {
        followPointer: false,
        hideDelay: 100,
        pointFormat: '<b>{point.y}</b><br/>',
        valueSuffix: ' casos'
      },
    }],
    title: {
      text: ''
    },
    loading: false
  };
  $scope.casesByNeighbourhoodConfig = {
    options: {
      chart: {
        type: 'column',
        zoomType: 'x'
      }
    },
    xAxis: {
      labels: {
        enabled: true,
        rotation: -45,
        formatter: function getLabelFromValue() {
          return $scope.casesByNeighbourhoodConfig.series[0].data[this.value][0];
        }
      }
    },
    yAxis: {
      title: {
        text: 'Casos'
      }
    },
    series: [{ 
      data: [],
      name: 'Bairros',
      tooltip: {
        followPointer: false,
        hideDelay: 100,
        pointFormat: '<b>{point.y}</b><br/>',
        valueSuffix: ' casos'
      },
    }],
    title: {
      text: ''
    },
    loading: false
  };
  
  $scope.close = function() {
    $mdSidenav('left').close();
  };
  
  $scope.mdIsOpen = $mdMedia('gt-md');
  
  $scope.changeActiveTab = function (tab) {
    $scope.activeTab = tab;
  };
  
  // Testing the chart
  $scope.typesByCity = ["Foco do mosquito", "Dengue", "Chikungunya", "Zika"];
  
  function countMarkersByType (markers, type) {
    return markers.filter(function (marker) { return marker.type === type; }).length;
  }
  
  $scope.$watch('markers.length', function (newLength, oldLength) {
    if (newLength && newLength !== oldLength) {
      var markers = $scope.markers;
      $scope.casesTypeConfig.series[0].data = [];
      var casesTypeByCity = $scope.casesTypeConfig.series[0].data;
      
      $scope.casesByNeighbourhoodConfig.series[0].data = [];
      var casesByNeighbourhood = $scope.casesByNeighbourhoodConfig.series[0].data;
      
      var currentDate = new Date();
      $scope.lastMonthsMarkersCount = 0;
      currentDate.setMilliseconds(999);
      currentDate.setSeconds(59);
      currentDate.setHours(23);
      var thresholdDate = new Date();
      thresholdDate.setMonth(currentDate.getMonth() - 3);
      
      var lastMonthsMarkers = markers.filter(function (marker) {
        var ret = false;
        if (new Date(marker.creationDate || marker.date) > thresholdDate) {
          $scope.lastMonthsMarkersCount++;        
          ret = true;
        }
        return ret;
      });
      
      casesTypeByCity.push({name: FOCUS_POINT_LABEL, color: casesTypeColorMap[FOCUS_POINT_LABEL], y: countMarkersByType(lastMonthsMarkers, MARKER_TYPES['Focus point']) });
      casesTypeByCity.push({name: DENGUE_LABEL,  color: casesTypeColorMap[DENGUE_LABEL], y: countMarkersByType(lastMonthsMarkers, MARKER_TYPES['Dengue case']) });
      casesTypeByCity.push({name: ZIKA_LABEL, color: casesTypeColorMap[ZIKA_LABEL], y: countMarkersByType(lastMonthsMarkers, MARKER_TYPES['Zika case']) });
      casesTypeByCity.push({name: CHIKUNGUNYA_LABEL, color: casesTypeColorMap[CHIKUNGUNYA_LABEL], y: countMarkersByType(lastMonthsMarkers, MARKER_TYPES['Chikungunya case']) });
      
      markers.forEach(function (marker, index) {
        var neighbourhood = marker.address? marker.address.neighbourhood : null;
        var seriesValueByNeighbourhood;
        if (neighbourhood) {
          seriesValueByNeighbourhood = casesByNeighbourhood.filter(function (seriesValue) {
            return seriesValue[0] === neighbourhood;
          })[0];
        } else {
          seriesValueByNeighbourhood = casesByNeighbourhood.filter(function (seriesValue) {
            return seriesValue[0] === 'Outros';
          })[0];
        }
        
        if (!seriesValueByNeighbourhood) {
          seriesValueByNeighbourhood = [neighbourhood || 'Outros', 1];
          casesByNeighbourhood.push(seriesValueByNeighbourhood);
        } else {
          casesByNeighbourhood[casesByNeighbourhood.indexOf(seriesValueByNeighbourhood)][1]++;
        }
        
      });
      
    }
  });
  
  $scope.$watch(function () { return $('#statistics').width(); }, function (currentValue, oldValue) {
    if (currentValue !== oldValue) {
      $('#cases-type-by-city').width(currentValue);
      $('#cases-by-neighbourhood').width(currentValue);
      
      $scope.casesTypeConfig.getHighcharts().redraw();
      $scope.casesByNeighbourhoodConfig.getHighcharts().redraw();
    }
  });

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

  }]).controller('DialogController', ['$scope', 'requestService', '$mdDialog', '$rootScope', '$http', 'mapDefaultOptions', '$timeout', '$mdToast', function($scope, requestService, $mdDialog, $rootScope, $http, mapDefaultOptions, $timeout, $mdToast) {
    var self = this;
    
    function getAddressFromAddressComponents(addressComponents) {
      var address = {};
      
      for (var i in addressComponents) {
        var addressComponent = addressComponents[i];
        
        for (var j in addressComponent.types) {
          var type = addressComponent.types[j];
          
          switch (type) {
            case 'street_number':
            address.streetNumber = addressComponent.long_name;
              break;
            case 'route':
              address.street = addressComponent.long_name;
              break;
            case 'sublocality_level_1' || 'sublocality':
              address.neighbourhood = addressComponent.long_name;
              break;
            case 'locality':
              address.city = addressComponent.long_name;
              break;
            case 'administrative_area_level_1':
              address.state = addressComponent.long_name;
              break;
            case 'country':
              address.country = addressComponent.long_name;
              break;
          }
        }
      }
      
      return address;
    }
    
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
              
              $scope.marker.address = getAddressFromAddressComponents(places[i].address_components);
              
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
      if ($scope.markerForm.$valid) {
        var marker = $scope.marker;
        
        if ($rootScope.creatorLocation !== undefined) {
          marker.creatorLocation.coordinates = [$rootScope.creatorLocation.longitude, $rootScope.creatorLocation.latitude];
        }
        
        if (!marker.address || !marker.address.neighbourhood) {
          var geocoder = new google.maps.Geocoder();
          var latlng = {lat: marker.location.coordinates[1], lng: marker.location.coordinates[0]};
          geocoder.geocode({ location: latlng }, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
              if (results[0]) {
                $scope.marker.address = getAddressFromAddressComponents(results[0].address_components);
              }
            }
            
            saveMarker(marker);
          });
        } else {
          saveMarker(marker);
        }
      }
    };
    
    function saveMarker(marker) {
      $http.post('/api/marker', marker)
        .then(function (response) {
          showToast('Caso salvo com sucesso!');
          $scope.hide();
        })
        .catch(function (response) {
          showToast(response.data.error.message);
        });
    }
    
    function showToast(message) {
      $mdToast.showSimple(message);
    }

    $scope.cases = [
    { type: "Foco do mosquisto", id: 1 },
    { type: "Caso de Zika", id: 2 },
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
