'use strict';
const methodSort = {
  GET: 0,
  HEAD: 1,
  POST: 2,
  PUT: 3,
  DELETE: 4,
  OPTIONS: 5
};

const constructResponse = (server) => {
  const runtime = {
    versions: Object.assign({}, process.versions),
    execPath: process.execPath,
    argv: process.argv.slice(),
    execArgv: process.execArgv.slice(),
    cwd: process.cwd(),
    env: Object.assign({}, process.env)
  };
  const connections = server.connections.map((connection) => {
    const plugins = {};

    Object.keys(connection.registrations).forEach((name) => {
      const registration = connection.registrations[name];
      const version = registration.version;

      /* This is to step around a code choice inside hapi. There is some code in
      * plugin.js that does a Joi validation and gives registration.attributes.pkg.version
      * a default value of 0.0.0 if not set, ignoring the one directly on the registration
      * function */
      const attributes = Object.assign({}, registration.attributes.pkg, { version });

      plugins[name] = {
        name,
        version,
        multiple: registration.attributes.multiple,
        options: registration.options,
        attributes
      };
    });

    const info = {
      uri: connection.info.uri,
      labels: connection.settings.labels,
      routes: connection.table().map((route) => {
        return {
          method: route.method.toUpperCase(),
          path: route.path,
          plugin: route.public.realm.plugin || null
        };
      }).sort((a, b) => {
        const pathCompare = a.path.localeCompare(b.path);
        if (pathCompare === 0) {
          return methodSort[a.method] - methodSort[b.method];
        }
        return pathCompare;
      }),
      plugins
    };

    return info;
  });

  return {
    runtime,
    connections
  };
};

module.exports = constructResponse;
