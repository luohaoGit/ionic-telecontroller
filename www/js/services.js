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

