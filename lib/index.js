'use strict';
var Hoek = require('hoek');

function constructResponse (server) {
  var runtime = {
    versions: Hoek.clone(process.versions),
    execPath: process.execPath,
    argv: Hoek.clone(process.argv),
    execArgv: Hoek.clone(process.execArgv),
    cwd: process.cwd(),
    env: Hoek.clone(process.env)
  };
  var connections = server.connections.map(function (connection) {
    var plugins = {};

    // TODO: Don't use _registrations and instead use a public API
    // related issue: https://github.com/hapijs/hapi/issues/2777
    Object.keys(connection._registrations).forEach(function (name) {
      var registration = connection._registrations[name];

      plugins[name] = {
        name: name,
        version: registration.version,
        multiple: registration.multiple,
        options: registration.options,
        attributes: registration.register.attributes
      };
    });

    var info = {
      uri: connection.info.uri,
      labels: connection.settings.labels,
      routes: connection.table().map(function (route) {
        return {
          method: route.method.toUpperCase(),
          path: route.path,
          plugin: route.public.realm.plugin || null
        };
      }).sort(function (a, b) {
        return a.path.localeCompare(b.path);
      }),
      plugins: plugins
    };

    return info;
  });

  return {
    runtime: runtime,
    connections: connections
  };
}

module.exports.register = function (server, options, next) {
  server.expose('setup', function () {
    return constructResponse(server);
  });

  next();
};

module.exports.register.attributes = {
  pkg: require('../package.json')
};
