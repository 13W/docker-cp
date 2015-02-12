'use strict';

/**
 * @ngdoc service
 * @name dockerUiApp.terminal
 * @description
 * # terminal
 * Service in the dockerUiApp.
 */
angular.module('dockerUiApp')
    .service('terminal', function () {
        var sockets = {};
        return function (element, address, events) {
            function initSocket(terminal) {
                var socket = terminal.socket,
                    clients = socket && socket.clients;

                if (!socket || socket.readyState !== 1) {
                    socket = terminal.socket = new WebSocket(address);
                }

                socket.clients = clients || [];
                if (socket.clients.indexOf(terminal) === -1) {
                    socket.clients.push(terminal);
                }
                sockets[address] = socket;

                function bind(event) {
                    socket['on' + event.toLowerCase()] = function () {
                        var self = this,
                            args = arguments;
                        angular.forEach(socket.clients, function (client) {
                            if (angular.isFunction(client['on' + event])) {
                                client['on' + event].apply(self, args);
                            }
                        });
                    };
                }
                bind('Open');
                bind('Message');
                bind('Close');
            }

            var socket = sockets[address],
                terminal = angular.extend({
                    socket: socket,
                    tty: new Terminal({
                        cols: 0,
                        rows: 0,
                        useStyle: true,
                        screenKeys: true
                    }),
                    onMessage: function (event) {
                        terminal.tty.write(event.data);
                    },
                    onClose: function () {
                        initSocket(terminal);
                    },
                    onData: function (data) {
                        if (terminal.socket.readyState === 1) {
                            terminal.socket.send(data);
                        }
                    }
                }, events);

            initSocket(terminal);
            terminal.tty.on('data', terminal.onData.bind(terminal.tty));
            terminal.tty.open(element);

            return {
                tty: terminal.tty,
                address: address,
                get socket() {
                    return terminal.socket || {clients: []};
                },
                set socket(value) {
                    return value;
                },
                destroy: function () {
                    terminal.tty.destroy();
                    var index = this.socket.clients.indexOf(terminal);
                    if (index > -1) {
                        this.socket.clients.splice(index, 1);
                    }
                    if (!this.socket.clients.length) {
                        this.socket.close();
                    }
                }
            };
        };
    });
