angular.module('starter.controllers', ['hmTouchEvents'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
})

.controller('MainCtrl', function($scope, $stateParams) {
  $scope.command = {};
  $scope.preX = 0;
  $scope.preY = 0;
  $scope.onHammer = function (event) {
    var type = event.type;
    if(type == 'pan') {
      var x = event.srcEvent.x;
      var y = event.srcEvent.y;
      $scope.command.deltaX = x - $scope.preX;
      $scope.command.deltaY = y - $scope.preY;
      $scope.preX = x;
      $scope.preY = y;
      $scope.command.code = 2;
      if(event.isFinal){
        $scope.preX = 0;
        $scope.preY = 0;
      }
    }else if(type == 'tap'){
      $scope.command.code = 3;
    }else if(type == 'doubletap'){
      $scope.command.code = 4;
    }else if(type == 'press'){
      $scope.command.code = 5;
    }
  };
});
