'use strict';

angular.module('dockerUiApp').controller('HostsCtrl', [
    '$rootScope', '$scope', '$location', '$cookies', 'Docker', 'hosts',
    function ($rootScope, $scope, $location, $cookies, Docker, hosts) {
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
                    return;
                }
                $location.path('/info');
            });
        };

        $scope.hostsOpts = {
            showSelection: true,
            actionButtons: [
                {
                    name: 'Delete',
                    class: 'btn-warning',
                    onSelection: true,
                    click: ['selection', function (hosts) {
                        var dockerHosts = Docker.hosts();
                        hosts.forEach(function (host) {
                            delete dockerHosts[host.url];
                        });
                        $cookies.dockerHosts = JSON.stringify(dockerHosts);
                        return true;
                    }]
                }
            ],
            colDef      : [
                {name: 'URL', field: 'url'},
                {name: 'last connected', field: 'lastConnected', filter: {name: 'date', options: 'mediumDate'}},
                {name: 'Created', field: 'created', filter: {name: 'date', options: 'mediumDate'}},
                {name     : 'Actions', buttons: [
                    {
                        name : '<i class="glyphicon glyphicon-log-in"></i> Connect',
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
