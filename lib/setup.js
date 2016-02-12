'use strict';
var Hoek = require('hoek');

var methodSort = {
  GET: 0,
  HEAD: 1,
  POST: 2,
  PUT: 3,
  DELETE: 4,
  OPTIONS: 5
};

var constructResponse = function (server) {
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

    Object.keys(connection.registrations).forEach(function (name) {
      var registration = connection.registrations[name];

      /* This is to step around a code choice inside hapi. There is some code in
       * plugin.js that does a Joi validation and gives registration.attributes.pkg.version
       * a defualt value of 0.0.0 if not set, ignoreing the one directly on the registration
       * function */

      var version = registration.version;
      var pkg = Hoek.clone(registration.attributes.pkg);
      pkg.version = version;

      plugins[name] = {
        name: name,
        version: version,
        multiple: registration.attributes.multiple,
        options: registration.options,
        attributes: pkg
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
        var pathCompare = a.path.localeCompare(b.path);
        if (pathCompare === 0) {
          return methodSort[a.method] - methodSort[b.method];
        }
        return pathCompare;
      }),
      plugins: plugins
    };

    return info;
  });

  return {
    runtime: runtime,
    connections: connections
  };
};

module.exports = constructResponse;
