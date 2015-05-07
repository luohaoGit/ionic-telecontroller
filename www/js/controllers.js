angular.module('starter.controllers', ['hmTouchEvents'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicLoading, $ionicPopup, defaultAvatar, $ionicPopover) {

  $scope.defaultAvatar = defaultAvatar;
  $scope.userData = localStorage.userdata ? JSON.parse(localStorage.userdata) : {};

})

.controller('LoginCtrl', function($scope, LoginService, UserService, CommonService, $state, $ionicPopup, $ionicLoading, $websocket, $rootScope, $timeout) {

  $scope.loginData = {
    username: localStorage.username,
    password: localStorage.password
  };

  $scope.otherData = {
    showLogin: true
  }

  $scope.$watch('settings.leftHandMode', function(newVal){
    localStorage.leftHandMode = newVal;
  });

  $scope.connect = function(){
    $ionicLoading.show({
     template: '正在连接...'
    });

    CommonService.createAndConnect(localStorage.ip, localStorage.port).success(function(soid){
      $ionicLoading.hide();
      $rootScope.soid = soid;
      $state.go('app.main');
    }).error(function(){
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: '温馨提示',
        template: '连接失败！',
        okText: '知道了'
      });
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

      if(localStorage.token && localStorage.teacherClassInfo
          && localStorage.username == $scope.loginData.username){//已经登陆过就不用再登录
        $ionicLoading.hide();
        $scope.connect();
      }else{
        LoginService.login($scope.loginData.username, $scope.loginData.password).success(function (data) {
          localStorage.username = $scope.loginData.username;
          localStorage.password = $scope.loginData.password;
          if(angular.isObject(data)){
            localStorage.token = data.retMsg;
            localStorage.userdata = JSON.stringify(data.retObj[0]);
            UserService.getClassInfo().success(function(classInfo){
              var tea = classInfo.data;

              var teaClasses = tea.handinclass;
              var handinclass = [];
              for(var i=0; i<teaClasses.length; i++){
                var c = teaClasses[i];
                var clazz = {
                  subjectId: c.subjectid,
                  subjectName: c.subjectname,
                  classId: c.classid,
                  className: c.classname
                }
                handinclass.push(clazz);
              }

              var teacherClassInfo = {
                userId: tea.username,
                userName: tea.truename,
                handinclass: handinclass
              }

              localStorage.teacherClassInfo = JSON.stringify(teacherClassInfo);
            }).error(function(err){
              console.log(err)
            });
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

.controller('MainCtrl', function($scope, $rootScope, $stateParams, $websocket, $ionicModal, $state, CommonService) {
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

    CommonService.send(data);
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
      data = data.concat(CommonService.stringToBytes(JSON.stringify($scope.command)));
      console.log($scope.command)
    }else if(type == 'tap'){
      data.push(3);
    }

    CommonService.send(data);
  };

  $scope.onSwipe = function(event) {
    var type = event.type;
    var data = [2];

    if(event.isFinal) {
      if (type == 'panup') {
        data.push(17);
      } else if (type == 'pandown') {
        data.push(18);
      }
      CommonService.send(data);
    }
  }

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
    CommonService.send(data);
  }

  $scope.$watch('buttonStates.textcontent', function(newVal){
    if(newVal.length > 0) {
      var obj = {
        text: newVal
      }
      var data = [2, 16];
      data = data.concat(CommonService.stringToBytes(JSON.stringify(obj)));

    }
  });

  $scope.$on("$ionicView.enter", function(){
    var data = [99, 201];
    data = data.concat(CommonService.toUTF8Array(localStorage.teacherClassInfo));
    CommonService.send(data, $rootScope.soid);
  });

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
