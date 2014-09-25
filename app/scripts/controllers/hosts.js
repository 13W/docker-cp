'use strict';

angular.module('dockerUiApp').controller('HostsCtrl', [
    '$rootScope', '$scope', 'Docker', 'hosts',
    function ($rootScope, $scope, Docker, hosts) {
        function normalize(hosts) {
            var result = [],
                host;
            for (host in hosts) {
                if (hosts.hasOwnProperty(host)) {
                    result.unshift({
                        url: host,
                        created: hosts[host].created,
                        lastConnected: hosts[host].lastConnected
                    });
                }
            }
            return result;
        }

        $scope.hosts = normalize(hosts);
        $scope.connectTo = '';

        $scope.connect = function (host) {
            host = host || $scope.connectTo;
            if (!host) {
                return;
            }
            Docker.connectTo(host, function (error) {
                if (error) {
                    $rootScope.alert.value = {msg: error.message, level: 'error'};
                }
            });
        };

        $scope.hostsOpts = {
            colDef      : [
                {name: 'URL', field: 'url'},
                {name: 'last connected', field: 'lastConnected', filter: {name: 'date', options: 'mediumDate'}},
                {name: 'Created', field: 'created', filter: {name: 'date', options: 'mediumDate'}},
                {name     : 'Actions', buttons: [
                    {
                        name : '<i class="glyphicon glyphicon-open"></i> Connect',
                        class: 'btn btn-xs btn-primary',
                        click: function (row) {
                            $scope.connect(row.url);
                        }
                    }
                ], compile: true}
            ],
            globalFilter: true
        };

    }]);