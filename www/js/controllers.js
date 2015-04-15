angular.module('starter.controllers', ['hmTouchEvents'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $websocket, $ionicLoading, $ionicPopup) {
  // Form data for the login modal
  $scope.loginData = {
    ip: localStorage.ip,
    port: localStorage.port ? parseInt(localStorage.port) : 6666
  };

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

    $ionicLoading.show({
      template: '正在连接...'
    });

    localStorage.ip = $scope.loginData.ip;
    localStorage.port = $scope.loginData.port;

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

.controller('SettingsCtrl', function($scope, $rootScope) {
  $scope.changeMode = function(){
    localStorage.leftHandMode = $rootScope.settings.leftHandMode;
  }

  $scope.$watch('settings.sensitivity', function(newVal){
    localStorage.sensitivity = newVal;
  });
})

.controller('MainCtrl', function($scope, $rootScope, $stateParams, $websocket) {
  var separator = "===!@#";
  $scope.command = {};
  $scope.deltaX = 0;
  $scope.deltaY = 0;
  $scope.showout = '';
  $scope.onHammer = function(event) {
    var type = event.type;
    var data = [];
    $scope.command = {};
    $scope.showout = type;
    if(type == 'pan') {
      $scope.command = {beginY:0, beginX:0};
      $scope.command.moveX = (event.deltaX - $scope.deltaX) * $rootScope.settings.sensitivity;
      $scope.command.moveY = (event.deltaY - $scope.deltaY) * $rootScope.settings.sensitivity;
      $scope.deltaX = event.deltaX;
      $scope.deltaY = event.deltaY;
      if(event.isFinal){
        $scope.deltaX = 0;
        $scope.deltaY = 0;
      }

      data = data.concat(0, 2, 2); //0代表调用方法类型，2代表模拟键值指令
      data.push(JSON.stringify($scope.command));
    }else if(type == 'tap'){
      data = data.concat(1, 2, 3);
    }else if(type == 'doubletap'){
      data = data.concat(1, 2, 5);
    }else if(type == 'press'){
      data = data.concat(1, 2, 5);
      cordova.plugins.Keyboard.show();
    }else if(type == 'swipeup'){
      data = data.concat(1, 2, 17);
    }else if(type == 'swipedown'){
      data = data.concat(1, 2, 18);
    }else if(type == 'swipeleft'){
      data = data.concat(1, 2, 19);
    }else if(type == 'swiperight'){
      data = data.concat(1, 2, 20);
    }

    $websocket.send(data.join(separator));
  };

  $scope.clickHandle = function(type) {
    var data = [];
    var leftCmd = 3, rightCmd = 4;

    if($rootScope.settings.leftHandMode){
      leftCmd = leftCmd + rightCmd;
      rightCmd = leftCmd - rightCmd;
      leftCmd = leftCmd - rightCmd;
    }

    if(type == 0){
      data = data.concat(1, 2, leftCmd);
    }else if(type == 1){
      data = data.concat(1, 2, rightCmd);
    }
    $websocket.send(data.join(separator));
  }

});
