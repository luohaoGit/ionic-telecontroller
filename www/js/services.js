angular.module('starter.services', [])
    .factory('$websocket', function ($q) {

        var ws;

        return {
            send: function(message) {
                if (angular.isString(message)) {
                    ws.send(message);
                }else if (angular.isObject(message)) {
                    ws.send(JSON.stringify(message));
                }
            },
            open: function(wsUri){
                var deferred = $q.defer();

                ws = new WebSocket(wsUri);

                ws.onopen = function () {
                    console.log('open');
                    deferred.resolve();
                };

                ws.onmessage = function (event) {
                    console.log(event.data);
                    this.close();
                };

                ws.onerror = function () {
                    console.log('error occurred!');
                    deferred.reject();
                };

                ws.onclose = function (event) {
                    console.log('close code=' + event.code);
                };

                return deferred.promise;
            },
            close: function(){
                ws.close();
            }
        };
    });

