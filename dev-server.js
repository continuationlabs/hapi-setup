'use strict';

var Assert = require('assert');
var Hapi = require('hapi');

var server = new Hapi.Server();

server.connection({ port: 8888 });

server.register([{
  register: require('./lib'),
  options: {
    _cacheView: false
  }
},
require('inert'),
require('vision')], function (err) {
  Assert.ifError(err);

  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply(request.server.plugins['hapi-setup'].setup());
    }
  });
  server.on('request-error', function (request, err) {
    console.log(err.message);
  });
  server.start(function () {
    console.log('Server started at ' + server.info.uri);
  });
});
