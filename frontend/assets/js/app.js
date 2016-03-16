(function(){
  'use strict';
  var app = angular.module('zicaMap', ['uiGmapgoogle-maps', 'ngMaterial']);
  
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
      },
        zoomControl: false
    };

    var socket = $window.io();
    
    $scope.map = { center: { latitude: -19.9304862, longitude: -43.9450135 }, zoom: 13 };

  }]).controller('AppCtrl', ['$scope', '$mdBottomSheet','$mdSidenav', '$mdDialog', function($scope, $mdBottomSheet, $mdSidenav, $mdDialog){
 
    $scope.showAdd = function(ev) {
      $mdDialog.show({
        controller: DialogController,
        template: '<md-dialog aria-label="Mango (Fruit)" class="md-padding"><md-content> <form name="userForm"> '+
        '<div layout layout-sm="column"> <md-input-container flex> <input ng-model="user.name" placeholder="Seu nome..."> </md-input-container> </div> '+
        '<div layout layout-sm="column"> <md-input-container flex> <input ng-model="user.adress" placeholder="Endereço..."> </md-input-container> </div> '+
        '<md-input-container flex> <label>Comentarios..</label> <textarea ng-model="user.comments" md-maxlength="150"></textarea> </md-input-container> </form> </md-content> '+
        // '<ui-gmap-google-map></ui-gmap-google-map>'+
        '<div class="md-actions" layout="row"> <span flex></span> '+
        '<md-button ng-click="answer(\'not useful\')"> Cancel </md-button> '+
        '<md-button ng-click="answer(\'useful\')" class="md-primary"> Save </md-button> </div></md-dialog>',
        targetEvent: ev,
      })
      .then(function(answer) {
        $scope.alert = 'You said the information was "' + answer + '".';
      }, function() {
        $scope.alert = 'You cancelled the dialog.';
      });
    };
  }]);

  function DialogController($scope, $mdDialog) {
    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.answer = function(answer) {
      $mdDialog.hide(answer);
    };
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