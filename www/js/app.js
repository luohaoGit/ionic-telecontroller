// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

/**
 * localStorage.ip
 * localStorage.port
 * localStorage.username
 * localStorage.password
 * localStorage.token
 * localStorage.userdata
 * localStorage.teacherClassInfo
 * localStorage.leftHandMode
 * localStorage.sensitivity
 */
angular.module('starter', ['ionic', 'starter.services', 'starter.controllers', 'starter.directives'])

.run(function($ionicPlatform, $rootScope, $location, $ionicHistory, CommonService) {

  $rootScope.settings = {
    ip: localStorage.ip,
    port: localStorage.port ? parseInt(localStorage.port) : 6666,
    sensitivity: localStorage.sensitivity ? parseInt(localStorage.sensitivity) : 1,
    leftHandMode: localStorage.leftHandMode == 'true' ? true : false,
    showLogin: true
  }

  $rootScope.soid = "";
  $rootScope.selectedClass = {};

  $ionicPlatform.registerBackButtonAction(function(e){
    if ($location.path() == '/app/main' || $location.path() == '/app/settings' || $location.path() == '/login') {
      if ($rootScope.backButtonPressedOnceToExit) {
        CommonService.exit();
        ionic.Platform.exitApp();
        return;
      }
      $rootScope.backButtonPressedOnceToExit = true;
      window.plugins.toast.showShortCenter(
          "再按一次退出程序",function(a){},function(b){}
      );
      setTimeout(function(){
        $rootScope.backButtonPressedOnceToExit = false;
      },2000);
    }else if($ionicHistory.backView()){
      $ionicHistory.goBack();
    }
    e.preventDefault();
    return false;
  },101);

  $ionicPlatform.ready(function() {
    CommonService.create();
    CommonService.registerReceive(function(info){
      var array = new Uint8Array(info.data);
      if(array.length >=3 && array[0] == 99 && array[1] == 106 && array[2] == 1){ //[99, 106, 1] 表示有别的连接
        ionic.trigger("connectFailed");
      }else if(array.length >=3 && array[0] == 99 && array[1] == 106 && array[2] == 0){
        ionic.trigger("connectSucceed");
      }else if(array.length >=3 && array[0] == 99 && array[1] == 204 && array[2] == 49){
        ionic.trigger("unfoldOnlineButton");
      }else{
        //alert(array[0]+  "-" + array[1] + "-" + array[2])
      }
    });
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  .state('app.main', {
    url: "/main",
    views: {
      'menuContent': {
        templateUrl: "templates/main.html",
        controller: 'MainCtrl'
      }
    }
  })

  .state('app.settings', {
    url: "/settings",
    views: {
      'menuContent': {
        templateUrl: "templates/settings.html",
        controller: 'SettingsCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
})
