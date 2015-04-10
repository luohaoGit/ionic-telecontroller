angular.module('starter.controllers', ['hmTouchEvents'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $websocket, $ionicLoading, $ionicPopup) {
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

    $ionicLoading.show({
      template: '正在连接...'
    });

    $websocket.open($scope.loginData.ip, $scope.loginData.port).then(function(){
      $ionicLoading.hide();
      $scope.closeLogin();
    }, function(){
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: '温馨提示',
        template: '连接失败！',
        okText: '知道了'
      }).then(function(res){
        $ionicLoading.hide();
      });
    });
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

.controller('MainCtrl', function($scope, $stateParams, $websocket) {
  $scope.command = {};
  $scope.deltaX = 0;
  $scope.deltaY = 0;
  $scope.showout = '';
  $scope.onHammer = function(event) {
    var type = event.type;
    if(type == 'pan') {
      $scope.command.moveX = event.deltaX - $scope.deltaX;
      $scope.command.moveY = event.deltaY - $scope.deltaY;
      $scope.command.code = 2;
      $scope.deltaX = event.deltaX;
      $scope.deltaY = event.deltaY;
      if(event.isFinal){
        $scope.deltaX = 0;
        $scope.deltaY = 0;
      }
    }else if(type == 'tap'){
      $scope.command.code = 3;
    }else if(type == 'doubletap'){
      $scope.command.code = 4;
      $scope.showout = type + ":" + new Date().getTime();
    }else if(type == 'press'){
      $scope.command.code = 100;
    }else if(type == 'swipeup'){
      $scope.command.code = 17;
      $scope.showout = type + ":" + new Date().getTime();
    }else if(type == 'swipedown'){
      $scope.command.code = 18;
      $scope.showout = type + ":" + new Date().getTime();
    }else if(type == 'swipeleft'){
      $scope.command.code = 19;
      $scope.showout = type + ":" + new Date().getTime();
    }else if(type == 'swiperight'){
      $scope.command.code = 20;
      $scope.showout = type + ":" + new Date().getTime();
    }
    $websocket.send(JSON.stringify($scope.command));
  };

  $scope.clickHandle = function(type) {
    if(type == 0){
      $scope.command.code = 3;
    }else if(type == 1){
      $scope.command.code = 101;
    }
    $websocket.send(JSON.stringify($scope.command));
  }
});
