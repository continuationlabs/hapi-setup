'use strict';
var Hapi = require('hapi');
var HapiSetup = require('../../lib');
var PluginFoo = require('./plugins').Foo;
var PluginBar = require('./plugins').Bar;

module.exports.prepareServer = function (options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var server = new Hapi.Server();

  server.connection({labels: ['public', 'private']});
  server.connection({labels: ['admin']});
  server.connection();

  server.route({
    method: 'GET',
    path: '/about',
    handler: function (request, reply) {
      reply(request.server.plugins['hapi-setup'].setup());
    }
  });

  server.register([
    {
      register: HapiSetup.register,
      options: options
    },
    {
      register: PluginFoo,
      options: {}
    },
    {
      register: PluginBar,
      options: {key: 'value'}
    }

  ], function (err) {
    var publicLabel = server.select('public');
    var privateLabel = server.select('private');
    var adminLabel = server.select('admin');

    server.route({
      method: 'GET',
      path: '/server-no-labels',
      config: {
        handler: function (request, reply) {}
      }
    });

    publicLabel.route({
      method: 'GET',
      path: '/server-public-label',
      config: {
        handler: function (request, reply) {}
      }
    });

    privateLabel.route({
      method: 'GET',
      path: '/server-private-label',
      config: {
        handler: function (request, reply) {}
      }
    });

    adminLabel.route({
      method: 'GET',
      path: '/server-admin-label',
      config: {
        handler: function (request, reply) {}
      }
    });

    callback(err, server);
  });
};
