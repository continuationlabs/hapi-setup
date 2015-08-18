'use strict';
var Hapi = require('hapi');
var HapiSetup = require('../../lib');

module.exports.prepareServer = function (options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var server = new Hapi.Server();

  server.connection({labels: ['public', 'private']});
  server.connection({labels: ['admin']});
  server.connection();

  server.register([
    {
      register: HapiSetup.register,
      options: options
    },
    {
      register: PluginFoo.register,
      options: {}
    },
    {
      register: PluginBar.register,
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

function fooRegister (server, options, next) {
  var publicLabel = server.select('public');
  var privateLabel = server.select('private');
  var adminLabel = server.select('admin');

  server.route({
    method: 'GET',
    path: '/foo-no-labels',
    config: {
      handler: function (request, reply) {}
    }
  });

  publicLabel.route({
    method: 'GET',
    path: '/foo-public-label',
    config: {
      handler: function (request, reply) {}
    }
  });

  privateLabel.route({
    method: 'GET',
    path: '/foo-private-label',
    config: {
      handler: function (request, reply) {}
    }
  });

  adminLabel.route({
    method: 'GET',
    path: '/foo-admin-label',
    config: {
      handler: function (request, reply) {}
    }
  });

  next();
}

fooRegister.attributes = {
  name: 'foo'
};

var PluginFoo = {
  register: fooRegister
};

function barRegister (server, options, next) {
  next();
}

barRegister.attributes = {
  name: 'bar',
  version: '1.0.0'
};

var PluginBar = {
  register: barRegister
};
