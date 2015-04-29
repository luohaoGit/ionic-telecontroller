angular.module('starter.controllers', ['hmTouchEvents'])

.controller('LoginCtrl', function($scope, LoginService, $state, $ionicPopup, $ionicLoading, $websocket, $rootScope) {
  $scope.connectData = {
    ip: localStorage.ip,
    port: localStorage.port ? parseInt(localStorage.port) : 6666
  };

  $scope.loginData = {
    username: localStorage.username,
    password: localStorage.password
  };

  $scope.otherData = {
    showLogin: false,
    leftHandMode: false
  }

  $scope.$watch('otherData.leftHandMode', function(newVal){
    localStorage.leftHandMode = newVal;
  });

  $scope.connectAndLogin = function(){

    if(!/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.test($scope.connectData.ip)){
      $ionicPopup.alert({
        title: '提示',
        template: '请输入正确IP'
      });
      return;
    }

    if(!/\d+/.test($scope.connectData.port)){
      $ionicPopup.alert({
        title: '提示',
        template: '请输入正确端口'
      });
      return;
    }

    $ionicLoading.show({
      template: '正在连接...'
    });

    localStorage.ip = $scope.connectData.ip;
    localStorage.port = $scope.connectData.port;

    $websocket.open($scope.connectData.ip, $scope.connectData.port).then(function(){
      $ionicLoading.hide();

      if($scope.otherData.showLogin){//需要登录

        $ionicLoading.show({
          template: '正在登录...'
        });

        if(localStorage.token && localStorage.username == $scope.loginData.username){//已经登陆过就不用再登录
          $ionicLoading.hide();
          $state.go('app.main');
        }else{
          LoginService.login($scope.loginData.username, $scope.loginData.password).success(function (data) {
            localStorage.username = $scope.loginData.username;
            localStorage.password = $scope.loginData.password;
            if(angular.isObject(data)){
              localStorage.token = JSON.stringify(data.retMsg);
              localStorage.userdata = JSON.stringify(data.retObj[0]);
            }
            $ionicLoading.hide();
            $state.go('app.main');
          }).error(function (data) {
            $ionicLoading.hide();
            var alertPopup = $ionicPopup.alert({
              title: '登录失败',
              template: '请检查您的用户名和密码'
            });
          });
        }
      }else{
        $state.go('app.main');
      }

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
  }
})

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicLoading, $ionicPopup, defaultAvatar, $ionicPopover) {

  $scope.defaultAvatar = defaultAvatar;
  $scope.userData = localStorage.userdata ? JSON.parse(localStorage.userdata) : {};

})

.controller('SettingsCtrl', function($scope, $rootScope, $state) {
  $scope.changeMode = function(){
    localStorage.leftHandMode = $rootScope.settings.leftHandMode;
  }

  $scope.$watch('settings.sensitivity', function(newVal){
    localStorage.sensitivity = newVal;
  });

  $scope.logout = function(){
    localStorage.removeItem("userdata");
    localStorage.removeItem("password");
    $state.go('login');
  }

  $scope.exit = function(){
    ionic.Platform.exitApp();
  }
})

.controller('MainCtrl', function($scope, $rootScope, $stateParams, $websocket, $ionicPopover) {
  var separator = "===!@#";
  $scope.command = {};
  $scope.otherData = {};
  $scope.deltaX = 0;
  $scope.deltaY = 0;
  $scope.toolbarShowed = false;
  $scope.keyboardShowed = false;
  $scope.curIndex = 1;
  $scope.buttonStates = {
    play: false,
    fullscreen: false
  }

  $scope.buttonClick = function (index) {
    if(index == 0){
      $scope.buttonStates.fullscreen = !$scope.buttonStates.fullscreen;
    }else if(index == 1){

    }else if(index == 2){
      $scope.buttonStates.play = !$scope.buttonStates.play;
    }else if(index == 3){

    }
  }

  $scope.showToolbar = function(index){
    $scope.curIndex = index;
    if(index == 0){
      $scope.curIndex = 1;
      $scope.toolbarShowed = !$scope.toolbarShowed;
    }else if(index == 1){
      $scope.toolbarShowed = false;
    }else if(index == 2){

    }else if(index == 3){

    }else if(index == 4){

    }

    if(index == 1){
      if($scope.keyboardShowed){
        $scope.keyboardShowed = false;
        cordova.plugins.Keyboard.close();
      }else{
        $scope.keyboardShowed = true;
        cordova.plugins.Keyboard.show();
      }
    }else{
      if($scope.keyboardShowed) {
        $scope.keyboardShowed = false;
        cordova.plugins.Keyboard.close();
      }
    }
  }

  $scope.fixedX = 0;
  $scope.fixedY = 0;

  $scope.onHammer = function(event) {
    var type = event.type;
    var data = [];

    if(event.srcEvent.touches[0] && event.srcEvent.touches[0].pageX){
      $scope.fixedX = event.srcEvent.touches[0].pageX + "px";
      $scope.fixedY = event.srcEvent.touches[0].pageY + "px";
    }

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
    }else if(type == 'swipeup'){
      data = data.concat(1, 2, 17);
    }else if(type == 'swipedown'){
      data = data.concat(1, 2, 18);
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
    }else if(type == 2){
      console.log($scope.otherData.contentToSend)
      $scope.otherData.contentToSend = '';
    }
    $websocket.send(data.join(separator));
  }
});
