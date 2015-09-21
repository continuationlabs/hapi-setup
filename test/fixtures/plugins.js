var Bar = function (server, options, next) {
  next();
};

Bar.attributes = {
  name: 'bar',
  version: '1.0.0'
};

var Foo = function (server, options, next) {
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
};

Foo.attributes = {
  name: 'foo'
};

module.exports = {
  Foo: Foo,
  Bar: Bar
};
