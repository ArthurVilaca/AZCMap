(function(){
  'use strict';
  var app = angular.module('zicaMap', ['uiGmapgoogle-maps', 'ngMaterial']);
  
  //Config the angular google maps to use our key
  app.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyBHdrTrrlUvUOMsU7SdCvZgKEUvutZL4HQ'
    });
  });
  
  app.controller("MapCtrl", ['$scope', '$window', '$mdSidenav',  function($scope, $window, $mdSidenav) {
    this.options = {
      streetViewControl: false,
      mapTypeControlOptions: {
        position: 10
      },
        zoomControl: false
    };

    var socket = $window.io();
    
    $scope.map = { center: { latitude: -19.9304862, longitude: -43.9450135 }, zoom: 13 };

    $scope.toggleLeft = function() {
      $mdSidenav('left').toggle();
    };

    $scope.markers = [];
    socket.on('Markers', function(data) {
      console.log(data);
      $scope.markers = data;
    });

}]).controller('StatisticsCtrl', function($scope, $mdSidenav) {
  
  $scope.close = function() {
    $mdSidenav('left').close();
  };

}).controller('AddMarkerCtrl', ['$scope', '$window', '$mdBottomSheet','$mdSidenav', '$mdDialog', function($scope, $window, $mdBottomSheet, $mdSidenav, $mdDialog){
 
    $scope.showAdd = function(ev) {
      $mdDialog.show({
        controller: DialogController,
        template: '<md-dialog aria-label="Mango (Fruit)" class="md-padding bidi" ng-cloak><md-content> <form name="userForm"> '+
        '<div layout layout-sm="column"> <md-input-container flex> <input ng-model="user.name" placeholder="Seu nome..."> </md-input-container> </div> '+
        '<div layout layout-sm="column"> <md-input-container flex> <input ng-model="user.adress" placeholder="Endereço..."> </md-input-container> </div> '+
        '<md-input-container flex> <label>Comentarios..</label> <textarea ng-model="user.comments" md-maxlength="150"></textarea> </md-input-container> </form> </md-content> '+
        // '<ui-gmap-google-map></ui-gmap-google-map>'+
        '<md-radio-group>'+
        '<md-radio-button ng-repeat="case in cases" value="case.id" aria-label="{{case.type}}">{{case.type}}</md-radio-button>'+
        '</md-radio-group>'+
        '<div class="md-actions" layout="row"> <span flex></span> '+
        '<md-button ng-click="hide();"> Cancelar </md-button> '+
        '<md-button ng-click="newMarker();" class="md-primary"> Salvar </md-button> </div></md-dialog>',
        targetEvent: ev,
      });
    };

  }]);

  function DialogController($scope, $mdDialog, $window) {
    var socket = $window.io();

    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.newMarker = function () {
      console.log("sending new marker to server");
      $scope.hide();
      socket.emit('new Marker', { id: "teste"});
    };

    $scope.cases = [{
      type: "Foco do mosquisto",
      id: 1
    },{
      type: "Caso de zica",
      id: 2
    },{
      type: "Caso de Dengue",
      id: 3
    }];

    $scope.type = undefined;
  };

  app.config(function($mdThemingProvider) {
    var customBlueMap =     $mdThemingProvider.extendPalette('light-blue', {
      'contrastDefaultColor': 'light',
      'contrastDarkColors': ['50'],
      '50': 'ffffff'
    });
    $mdThemingProvider.definePalette('customBlue', customBlueMap);
    $mdThemingProvider.theme('default')
      .primaryPalette('customBlue', {
        'default': '500',
        'hue-1': '50'
      })
      .accentPalette('red');
    $mdThemingProvider.theme('input', 'default')
          .primaryPalette('grey')
  });
  
})();
