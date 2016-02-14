'use strict';
const Path = require('path');

const setup = require('./setup');
const defaults = {
  endpoint: '/setup',
  ui: true,
  auth: false,
  _cacheView: true
};

const buildUi = function (settings) {
  return function (server, next) {
    server.views({
      engines: {
        jade: require('jade')
      },
      path: Path.resolve('./assets/views'),
      // only need this during dev mode
      isCached: settings._cacheView,
      context: {
        endpoint: settings.endpoint
      }
    });

    server.route([{
      method: 'GET',
      path: settings.endpoint,
      config: {
        handler: function (request, reply) {
          const data = setup(request.server);
          reply.view('index', data);
        },
        auth: settings.auth
      }
    }, {
      method: 'GET',
      path: settings.endpoint + '/public/{file}',
      config: {
        handler: {
          directory: {
            path: process.cwd() + '/build/',
            lookupCompressed: true,
            index: false
          }
        },
        auth: false,
        cache: {
          expiresIn: 3.154e10 // HTTP spec says don't set expiresIn more than one year out
        }
      }
    }]);

    return next();
  };
};

module.exports.register = function (server, options, next) {
  const settings = Object.assign({}, defaults, options);

  server.expose('setup', function () {
    return setup(server);
  });

  if (settings.ui) {
    server.dependency(['inert', 'vision'], buildUi(settings));
  }

  return next();
};

module.exports.register.attributes = {
  pkg: require('../package.json')
};
