'use strict';

// Services.

// Socket.io wrapper.
sutterbus.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    of: function (nameSpace, eventName, callback) {
      socket.of(nameSpace).on(eventName, function() {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    on: function (eventName, callback) {
      // var socket = io.connect('/' + nameSpace);
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      // var socket = io.connect('/' + nameSpace);
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