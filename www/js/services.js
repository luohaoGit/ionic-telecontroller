angular.module('starter.services', [])
    .service('LoginService', function($q) {
        return {
            login: function(name, pw) {
                var deferred = $q.defer();
                var promise = deferred.promise;

                if (name == 'user' && pw == '123456') {
                    deferred.resolve('Welcome ' + name + '!');
                } else {
                    deferred.reject('Wrong credentials.');
                }
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

