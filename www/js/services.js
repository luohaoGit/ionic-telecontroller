angular.module('starter.services', [])
    .factory('websocket', function ($websocket, $q) {

        var ws;

        return {
            status: function() {
                return ws.readyState;
            },
            send: function(message) {
                if (angular.isString(message)) {
                    ws.send(message);
                }else if (angular.isObject(message)) {
                    ws.send(JSON.stringify(message));
                }
            },
            open: function(wsUri){
                var deferred = $q.defer();

                ws = $websocket(wsUri);

                ws.onMessage(function(event) {
                    console.log('message: ', event);
                    var res;
                    try {
                        res = JSON.parse(event.data);
                    } catch(e) {
                        res = {'message': event.data};
                    }
                    console.log(res);
                });

                ws.onError(function(event) {
                    console.log('connection Error', event);
                    deferred.reject();
                });

                ws.onClose(function(event) {
                    console.log('connection closed', event);
                });

                ws.onOpen(function() {
                    console.log('connection open');
                    deferred.resolve();
                });

                return deferred.promise;
            },
            close: function(){
                ws.close();
            }

        };
    });

