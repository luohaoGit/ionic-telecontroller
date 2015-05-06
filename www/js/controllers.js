angular.module('starter.controllers', ['hmTouchEvents'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicLoading, $ionicPopup, defaultAvatar, $ionicPopover) {

  $scope.defaultAvatar = defaultAvatar;
  $scope.userData = localStorage.userdata ? JSON.parse(localStorage.userdata) : {};

})

.controller('LoginCtrl', function($scope, LoginService, $state, $ionicPopup, $ionicLoading, $websocket, $rootScope, $timeout) {

  $scope.loginData = {
    username: localStorage.username,
    password: localStorage.password
  };

  $scope.otherData = {
    showLogin: false
  }

  $scope.$watch('settings.leftHandMode', function(newVal){
    localStorage.leftHandMode = newVal;
  });

  $scope.connect = function(){
    $ionicLoading.show({
     template: '正在连接...'
    });

    chrome.sockets.tcp.create(function(createInfo) {
      chrome.sockets.tcp.connect(createInfo.socketId, localStorage.ip, localStorage.port,
          function(result) {
            $ionicLoading.hide();
            if (result === 0) {
              console.log('connect: success');
              $rootScope.soid = createInfo.socketId;
              $state.go('app.main');
            }else{
              $ionicPopup.alert({
                title: '温馨提示',
                template: '连接失败！',
                okText: '知道了'
              });
            }
          },
          function(error){
            $ionicLoading.hide();
            $ionicPopup.alert({
              title: '温馨提示',
              template: '连接失败！',
              okText: '知道了'
            });
          }
      );
    });
  }

  $scope.connectAndLogin = function(){

    if(!/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.test($rootScope.settings.ip)){
      $ionicPopup.alert({
        title: '提示',
        template: '请输入正确IP'
      });
      return;
    }

    if(!/\d+/.test($rootScope.settings.port)){
      $ionicPopup.alert({
        title: '提示',
        template: '请输入正确端口'
      });
      return;
    }

    localStorage.ip = $rootScope.settings.ip;
    localStorage.port = $rootScope.settings.port;

    if($scope.otherData.showLogin){//需要登录

      $ionicLoading.show({
        template: '正在登录...'
      });

      if(localStorage.token && localStorage.username == $scope.loginData.username){//已经登陆过就不用再登录
        $ionicLoading.hide();
        $scope.connect();
      }else{
        LoginService.login($scope.loginData.username, $scope.loginData.password).success(function (data) {
          localStorage.username = $scope.loginData.username;
          localStorage.password = $scope.loginData.password;
          if(angular.isObject(data)){
            localStorage.token = JSON.stringify(data.retMsg);
            localStorage.userdata = JSON.stringify(data.retObj[0]);
          }
          $ionicLoading.hide();
          $scope.connect();
        }).error(function (data) {
          $ionicLoading.hide();
          $ionicPopup.alert({
            title: '登录失败',
            template: '请检查您的用户名和密码'
          });
        });
      }
    }else{
      $scope.connect();
    }
  }
})

.controller('MainCtrl', function($scope, $rootScope, $stateParams, $websocket, $ionicModal, $state) {
  $scope.command = {};
  $scope.otherData = {};
  $scope.deltaX = 0;
  $scope.deltaY = 0;
  $scope.toolbarShowed = false;
  $scope.keyboardShowed = false;
  $scope.curIndex = 1;
  $scope.buttonStates = {
    textcontent: "",
    play: false,
    fullscreen: false
  }

  $scope.send = function(array){
    var uint8 = new Uint8Array(array);
    chrome.sockets.tcp.send($rootScope.soid, uint8.buffer, function(result) {
      if (result.resultCode === 0) {
        console.log('connectAndSend: success');
      }
    });
  }

  $scope.stringToBytes = function(str) {
    var ch, st, re = [];
    for (var i = 0; i < str.length; i++ ) {
      ch = str.charCodeAt(i);  // get char
      st = [];                 // set up "stack"
      do {
        st.push( ch & 0xFF );  // push byte to stack
        ch = ch >> 8;          // shift value down by 1 byte
      }
      while ( ch );
      // add stack contents to result
      // done because chars have "wrong" endianness
      re = re.concat( st.reverse() );
    }
    // return an array of bytes
    return re;
  }

  $scope.buttonClick = function (index) {
    var data = [2];

    if (index == 0) {
      if($scope.buttonStates.fullscreen){
        data.push(7);
      }else{
        data.push(8);
      }
      $scope.buttonStates.fullscreen = !$scope.buttonStates.fullscreen;
    } else if (index == 1) {
      data.push(5);
    } else if (index == 2) {
      if($scope.buttonStates.play){
        data.push(9);
      }else{
        data.push(10);
      }
      $scope.buttonStates.play = !$scope.buttonStates.play;
    } else if (index == 3) {
      data.push(6);
    }

    $scope.send(data);
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

    }else if(index == 5){
      $scope.modal.show();
    }

    if(index == 1){
      if($scope.keyboardShowed){
        $scope.keyboardShowed = false;
        //cordova.plugins.Keyboard.close();
      }else{
        $scope.keyboardShowed = true;
        //cordova.plugins.Keyboard.show();
      }
    }else{
      if($scope.keyboardShowed) {
        $scope.keyboardShowed = false;
        //cordova.plugins.Keyboard.close();
      }
    }
  }

  $scope.$watch('buttonStates.textcontent', function(newVal){
    if(newVal.length > 0) {
      var obj = {
        text: newVal
      }
      var data = [2, 16];
      data = data.concat($scope.stringToBytes(JSON.stringify(obj)));

    }
  });

  $scope.fixedX = 0;
  $scope.fixedY = 0;

  $scope.onHammer = function(event) {
    var type = event.type;
    var data = [2];

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
      data.push(2); //0代表调用方法类型，2代表模拟键值指令
      data = data.concat($scope.stringToBytes(JSON.stringify($scope.command)));
      console.log($scope.command)
    }else if(type == 'tap'){
      data.push(3);
    }else if(type == 'swipeup'){
      data.push(17);
    }else if(type == 'swipedown'){
      data.push(18);
    }

    $scope.send(data);
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
      data = data.concat(2, leftCmd);
    }else if(type == 1){
      data = data.concat(2, rightCmd);
    }
    $scope.send(data);
  }


  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/settings.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeModel = function() {
    localStorage.ip = $rootScope.settings.ip;
    localStorage.port = $rootScope.settings.port;
    $scope.modal.hide();
  };

  $scope.changeMode = function(){
    localStorage.leftHandMode = $rootScope.settings.leftHandMode;
  }

  $scope.$watch('settings.sensitivity', function(newVal){
    localStorage.sensitivity = newVal;
  });

  $scope.logout = function(){
    localStorage.removeItem("userdata");
    localStorage.removeItem("token");
    localStorage.removeItem("password");
    $state.go('login');
  }

  $scope.exit = function(){
    chrome.sockets.tcp.disconnect($rootScope.soid);
    chrome.sockets.tcp.close($rootScope.soid);
    ionic.Platform.exitApp();
  }

});
