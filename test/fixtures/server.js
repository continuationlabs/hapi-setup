'use strict';
var Hapi = require('hapi');
var Inert = require('inert');
var Vision = require('vision');
var HapiSetup = require('../../lib');
var Plugins = require('./plugins');

module.exports.prepareServer = function (options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var server = new Hapi.Server();

  server.connection({labels: ['public', 'private']});
  server.connection({labels: ['admin']});
  server.connection();

  server.route([{
    method: 'GET',
    path: '/about',
    handler: function (request, reply) {
      reply(request.server.plugins['hapi-setup'].setup());
    }
  },{
    method: 'POST',
    path: '/about',
    handler: function (request, reply) {
      reply(request.body);
    }
  }]);

  server.register([
    Inert,
    Vision,
    {
      register: HapiSetup.register,
      options: options
    },
    {
      register: Plugins.Foo,
      options: {}
    },
    {
      register: Plugins.Bar,
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

    server.start(function () {
      callback(err, server);
    });
  });
};
