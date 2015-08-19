'use strict';
var Hoek = require('hoek');
var defaults = {
  path: '/hapi-setup',
  dataPath: '/hapi-setup/data'
};

function constructResponse (server) {
  var runtime = {
    versions: Hoek.clone(process.versions),
    execPath: process.execPath,
    argv: Hoek.clone(process.argv),
    execArgv: Hoek.clone(process.execArgv),
    cwd: process.cwd(),
    // This should probably be a clone(), but Hoek is currently breaking
    // when working with process.env on 0.10
    env: process.env
  };
  var connections = server.connections.map(function (connection) {
    var plugins = {};

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
  options = Hoek.applyToDefaults(defaults, options, true, false);
  server.route([
    {
      method: 'GET',
      path: options.path,
      config: {
        description: 'Display server configuration information as HTML',
        handler: function (request, reply) {
          // var data = constructResponse(request.server);
          var html = '<!DOCTYPE html><html><body>Coming Soon</body></html>';

          reply(html);
        }
      }
    },
    {
      method: 'GET',
      path: options.dataPath,
      config: {
        description: 'Display server configuration information as JSON',
        handler: function (request, reply) {
          var data = constructResponse(request.server);

          reply(data);
        }
      }
    }
  ]);

  next();
};

module.exports.register.attributes = {
  pkg: require('../package.json')
};
