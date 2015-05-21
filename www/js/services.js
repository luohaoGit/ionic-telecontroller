angular.module('starter.services', [])
    .service('LoginService', function($q, $http) {
        return {
            login: function(name, pw) {
                var separator = "===!@#";
                var deferred = $q.defer();
                var promise = deferred.promise;

                var loginUrl = "http://comm.zxyq.com.cn:7080/JxlltTeaservice_comm.ashx";
                var reqContent = "?requestmethod_opera=fun_user_token_login&Usertype=1&Source=Android&Logintype=0";
                var username = "&Userid=";
                var pwd = "&Userpwd=";

                window.tlantic.plugins.socket.des(name + separator + pw, function(res){
                    var arr = res.split(separator);
                    username += arr[0];
                    pwd += arr[1];
                    //3023002==741506
                    $http.post(loginUrl + reqContent + username + pwd)
                        .success(function(res){
                            if(res.retCode == '0'){//登录成功
                                deferred.resolve(res);
                            }else{
                                deferred.reject();
                            }
                        }).error(function(data) {
                            deferred.reject();
                        });
                }, function(){});

                promise.success = function(fn) {
                    promise.then(fn);
                    return promise;
                }
                promise.error = function(fn) {
                    promise.then(null, fn);
                    return promise;
                }
                return promise;
            }
        }
    })

    .service('UserService', function($q, $http) {
        return {
            getClassInfo: function() {
                var deferred = $q.defer();
                var promise = deferred.promise;
                var userdata = JSON.parse(localStorage.userdata);
                var infoUrl = "http://plesson.zxyq.com.cn/api.php";
                var relativeUrl = "/home/user/teacherInformation.html";
                var reqContent = "?userid=" + localStorage.username + "&token=" + localStorage.token
                                + "&teachertimestamp=0" + "&areaid=" + userdata.areaid + "&schid=" + userdata.schid;

                $http.post(infoUrl + relativeUrl + reqContent)
                    .success(function(res){
                        if(res.status == 0){
                            deferred.resolve(res);
                        }else{
                            deferred.reject();
                        }
                    }).error(function(data) {
                        deferred.reject();
                    });

                promise.success = function(fn) {
                    promise.then(fn);
                    return promise;
                }
                promise.error = function(fn) {
                    promise.then(null, fn);
                    return promise;
                }
                return promise;
            }
        }
    })


    .service('CommonService', function($q, $ionicLoading, $ionicPopup, $rootScope, $timeout, $state) {
        return {
            toUTF8Array: function(str) {
                var utf8 = [];
                for (var i=0; i < str.length; i++) {
                    var charcode = str.charCodeAt(i);
                    if (charcode < 0x80) utf8.push(charcode);
                    else if (charcode < 0x800) {
                        utf8.push(0xc0 | (charcode >> 6),
                            0x80 | (charcode & 0x3f));
                    }
                    else if (charcode < 0xd800 || charcode >= 0xe000) {
                        utf8.push(0xe0 | (charcode >> 12),
                            0x80 | ((charcode>>6) & 0x3f),
                            0x80 | (charcode & 0x3f));
                    }
                    // surrogate pair
                    else {
                        i++;
                        // UTF-16 encodes 0x10000-0x10FFFF by
                        // subtracting 0x10000 and splitting the
                        // 20 bits of 0x0-0xFFFFF into two halves
                        charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                        | (str.charCodeAt(i) & 0x3ff))
                        utf8.push(0xf0 | (charcode >>18),
                            0x80 | ((charcode>>12) & 0x3f),
                            0x80 | ((charcode>>6) & 0x3f),
                            0x80 | (charcode & 0x3f));
                    }
                }
                return utf8;
            },

            stringToBytes: function(str) {
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
            },

            send: function(array, soid){
                var uint8 = new Uint8Array(array);
                chrome.sockets.tcp.send(soid, uint8.buffer, function(result) {
                    if (result.resultCode === 0) {
                        console.log('connectAndSend: success');
                    }
                });
            },

            registerReceive: function(cb){
                chrome.sockets.tcp.onReceive.addListener(cb);
            },

            exit: function(){
                var array = [99, 104];
                var uint8 = new Uint8Array(array);
                chrome.sockets.tcp.send($rootScope.soid, uint8.buffer, function(result) {
                    chrome.sockets.tcp.disconnect($rootScope.soid);
                    chrome.sockets.tcp.close($rootScope.soid);
                });
            },

            create: function(){
                chrome.sockets.tcp.create(function(createInfo) {
                    $rootScope.soid = createInfo.socketId;
                });
            },

            connect: function(ip, port) {
                var deferred = $q.defer();
                var promise = deferred.promise;

                //chrome.sockets.tcp.onReceive.listeners = [];
                chrome.sockets.tcp.onReceive.addListener(function(info){
                    var array = new Uint8Array(info.data);
                    if(array.length >=3 && array[0] == 99 && array[1] == 106 && array[2] == 1){ //[99, 106, 1] 表示有别的连接
                        deferred.reject(-2);
                    }else{
                        deferred.resolve();
                    }
                });

                chrome.sockets.tcp.connect($rootScope.soid, ip, port,
                    function(result) {
                        if (result === 0) {
                            $timeout(function(){
                                deferred.resolve();
                            }, 8*1000);
                        }else{
                            deferred.reject(result);
                        }
                    },
                    function(error){
                        deferred.reject(-1);
                    }
                );

                promise.success = function(fn) {
                    promise.then(fn);
                    return promise;
                }
                promise.error = function(fn) {
                    promise.then(null, fn);
                    return promise;
                }
                return promise;
            },

            detectAndReconnect: function(ip, port){
                chrome.sockets.tcp.getInfo($rootScope.soid, function(info){
                    if(!info.connected){
                        $ionicLoading.show({
                            template: '正在重连...'
                        });
                        chrome.sockets.tcp.connect(soid, ip, port,
                            function(result) {
                                if (result === 0) {
                                    ionic.trigger("enterMain");
                                    $ionicLoading.hide();
                                    $ionicLoading.show({
                                        template: '连接成功！',
                                        duration: 1000
                                    });
                                }else{
                                    $ionicLoading.hide();
                                    $ionicLoading.show({
                                        template: '与服务器断开连接！',
                                        duration: 1000
                                    });
                                }
                            },
                            function(error){

                            }
                        );
                    }
                });
            }
        }
    })















    .factory('$websocket', function ($q) {

        var sid, host, port;

        return {
            send: function(message) {
                if(!sid)
                    return;

                window.tlantic.plugins.socket.send(
                    function () {
                        console.log('worked!');
                    },

                    function () {
                        console.log('failed!');
                    },
                    host + ':' + port,
                    message
                );
            },
            open: function(h, p){
                var deferred = $q.defer();

                window.tlantic.plugins.socket.connect(
                    function (connectionId) {
                        sid = connectionId;
                        host = h;
                        port = p;
                        console.log('worked! This is the connection ID: ', connectionId);
                        deferred.resolve(connectionId);
                    },

                    function () {
                        console.log('failed!');
                        deferred.reject();
                    },
                    h,
                    p
                );

                return deferred.promise;
            },
            close: function(){
                sid = null;
                window.tlantic.plugins.socket.disconnect(
                    function () {
                        console.log('worked!');
                    },

                    function () {
                        console.log('failed!');
                    },
                    host + ':' + port
                );
            }

        };
    });

