'use strict';

const Bar = (server, options, next) => {
  next();
};

Bar.attributes = {
  name: 'bar',
  version: '1.0.0'
};

const Foo = (server, options, next) => {
  const publicLabel = server.select('public');
  const privateLabel = server.select('private');
  const adminLabel = server.select('admin');

  server.route({
    method: 'GET',
    path: '/foo-no-labels',
    config: {
      handler: (request, reply) => {}
    }
  });

  publicLabel.route({
    method: 'GET',
    path: '/foo-public-label',
    config: {
      handler: (request, reply) => {}
    }
  });

  privateLabel.route({
    method: 'GET',
    path: '/foo-private-label',
    config: {
      handler: (request, reply) => {}
    }
  });

  adminLabel.route({
    method: 'GET',
    path: '/foo-admin-label',
    config: {
      handler: (request, reply) => {}
    }
  });

  next();
};

Foo.attributes = {
  name: 'foo'
};

module.exports = { Foo, Bar };
