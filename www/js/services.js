angular.module('starter.services', [])
    .factory('$websocket', function ($q) {

        var sid, host, port;

        return {
            send: function(message) {
                var data = 'This is the data i want to send!';
                if (angular.isString(message)) {
                    data = message;
                }else if (angular.isObject(message)) {
                    data = JSON.stringify(message);
                }

                window.tlantic.plugins.socket.send(
                    function () {
                        alert('worked!')
                        console.log('worked!');
                    },

                    function () {
                        alert('failed!')
                        console.log('failed!');
                    },
                    host + ':' + port,
                    data
                );
            },
            open: function(h, p){
                var deferred = $q.defer();

                window.tlantic.plugins.socket.connect(
                    function (connectionId) {
                        sid = connectionId;
                        host = h;
                        port = p;
                        deferred.resolve(connectionId);
                        console.log('worked! This is the connection ID: ', connectionId);
                    },

                    function () {
                        deferred.resolve();
                        console.log('failed!');
                    },
                    h,
                    p
                );

                return deferred.promise;
            },
            close: function(){
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

