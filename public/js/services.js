'use strict';

// Services.

// Socket.io wrapper.
sutterbus.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    of: function (nameSpace, eventName, timeout, callback) {
      socket.of(nameSpace).on(eventName, function() {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
        setTimeout( function () {
          console.log('timeout');
          socket.disconnect();
        }, timeout);
      });
    },
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
});