'use strict';
const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const HapiSetup = require('../../lib');
const Plugins = require('./plugins');

module.exports.prepareServer = (options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  const server = new Hapi.Server();

  server.connection({labels: ['public', 'private']});
  server.connection({labels: ['admin']});
  server.connection();

  server.route([{
    method: 'GET',
    path: '/about',
    handler: (request, reply) => {
      reply(request.server.plugins['hapi-setup'].setup());
    }
  },{
    method: 'POST',
    path: '/about',
    handler: (request, reply) => {
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

  ], (err) => {
    const publicLabel = server.select('public');
    const privateLabel = server.select('private');
    const adminLabel = server.select('admin');

    server.route({
      method: 'GET',
      path: '/server-no-labels',
      config: {
        handler: (request, reply) => {}
      }
    });

    publicLabel.route({
      method: 'GET',
      path: '/server-public-label',
      config: {
        handler: (request, reply) => {}
      }
    });

    privateLabel.route({
      method: 'GET',
      path: '/server-private-label',
      config: {
        handler: (request, reply) => {}
      }
    });

    adminLabel.route({
      method: 'GET',
      path: '/server-admin-label',
      config: {
        handler: (request, reply) => {}
      }
    });

    server.start(() => {
      callback(err, server);
    });
  });
};
