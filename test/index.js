'use strict';
const Code = require('code');
const Joi = require('joi');
const Lab = require('lab');
const Package = require('../package.json');
const Server = require('./fixtures/server');
const Schema = require('./fixtures/schema');

// Test shortcuts
const lab = exports.lab = Lab.script();
const expect = Code.expect;
const describe = lab.describe;
const it = lab.it;

Code.settings.truncateMessages = false;

const getData = (server, url, callback) => {
  if (typeof url === 'function') {
    callback = url;
    url = '/about';
  }

  server.select('public').inject({ method: 'GET', url }, callback);
};

describe('hapi-setup Plugin', () => {
  it('supports multiple connections', (done) => {
    Server.prepareServer((err, server) => {
      expect(err).to.not.exist();
      getData(server, (res) => {
        expect(res.statusCode).to.equal(200);

        const connections = res.result.connections;

        expect(connections).to.be.an.array();
        expect(connections.length).to.equal(3);
        expect(connections[0].uri).to.exist();
        expect(connections[0].labels).to.deep.equal(['public', 'private']);
        expect(connections[1].uri).to.exist();
        expect(connections[1].labels).to.deep.equal(['admin']);
        expect(connections[2].uri).to.exist();
        expect(connections[2].labels).to.deep.equal([]);
        done();
      });
    });
  });

  it('returns routing tables by connection', (done) => {
    Server.prepareServer((err, server) => {
      expect(err).to.not.exist();
      getData(server, (res) => {
        expect(res.statusCode).to.equal(200);

        const connections = res.result.connections;

        expect(connections[0].routes).to.deep.include([{
          method: 'GET',
          path: '/foo-no-labels',
          plugin: 'foo'
        },
        {
          method: 'GET',
          path: '/foo-private-label',
          plugin: 'foo'
        },
        {
          method: 'GET',
          path: '/foo-public-label',
          plugin: 'foo'
        },
        {
          method: 'GET',
          path: '/setup',
          plugin: 'hapi-setup'
        },
        {
          method: 'GET',
          path: '/setup/public/{file}',
          plugin: 'hapi-setup'
        },
        {
          method: 'GET',
          path: '/about',
          plugin: null
        },
        {
          method: 'POST',
          path: '/about',
          plugin: null
        },
        {
          method: 'GET',
          path: '/server-no-labels',
          plugin: null
        },
        {
          method: 'GET',
          path: '/server-private-label',
          plugin: null
        },
        {
          method: 'GET',
          path: '/server-public-label',
          plugin: null
        }]);

        expect(connections[1].routes).to.deep.include([{
          method: 'GET',
          path: '/foo-admin-label',
          plugin: 'foo'
        },
        {
          method: 'GET',
          path: '/foo-no-labels',
          plugin: 'foo'
        },
        {
          method: 'GET',
          path: '/setup',
          plugin: 'hapi-setup'
        },
        {
          method: 'GET',
          path: '/setup/public/{file}',
          plugin: 'hapi-setup'
        },
        {
          method: 'GET',
          path: '/about',
          plugin: null
        },
        {
          method: 'POST',
          path: '/about',
          plugin: null
        },
        {
          method: 'GET',
          path: '/server-admin-label',
          plugin: null
        },
        {
          method: 'GET',
          path: '/server-no-labels',
          plugin: null
        }]);

        expect(connections[2].routes).to.deep.include([{
          method: 'GET',
          path: '/foo-no-labels',
          plugin: 'foo'
        },
        {
          method: 'GET',
          path: '/setup',
          plugin: 'hapi-setup'
        },
        {
          method: 'GET',
          path: '/setup/public/{file}',
          plugin: 'hapi-setup'
        },
        {
          method: 'GET',
          path: '/about',
          plugin: null
        },
        {
          method: 'POST',
          path: '/about',
          plugin: null
        },
        {
          method: 'GET',
          path: '/server-no-labels',
          plugin: null
        }]);

        done();
      });
    });
  });

  it('returns node configuration information', (done) => {
    Server.prepareServer((err, server) => {
      expect(err).to.not.exist();
      getData(server, (res) => {
        expect(res.statusCode).to.equal(200);

        const runtime = res.result.runtime;

        expect(runtime).to.be.an.object();
        expect(runtime.versions).to.deep.equal(process.versions);
        expect(runtime.execPath).to.equal(process.execPath);
        expect(runtime.argv).to.deep.equal(process.argv);
        expect(runtime.execArgv).to.deep.equal(process.execArgv);
        expect(runtime.cwd).to.equal(process.cwd());
        // This should be a deep equal, but Hoek is currently breaking
        // when working with process.env
        expect(runtime.env).to.be.an.object();
        done();
      });
    });
  });

  it('returns plugin information', (done) => {
    Server.prepareServer((err, server) => {
      expect(err).to.not.exist();
      getData(server, (res) => {
        expect(res.statusCode).to.equal(200);

        const plugins = res.result.connections[0].plugins;

        expect(plugins).to.be.an.object();
        expect(Object.keys(plugins)).to.deep.equal(['inert', 'vision', 'hapi-setup', 'foo', 'bar']);

        const hapiSetup = plugins['hapi-setup'];

        expect(hapiSetup.name).to.equal(Package.name);
        expect(hapiSetup.version).to.equal(Package.version);
        expect(hapiSetup.multiple).to.equal(false);
        expect(hapiSetup.options).to.deep.equal({});
        expect(hapiSetup.attributes).to.be.an.object();
        expect(hapiSetup.attributes).to.deep.equal(Package);
        expect(plugins.foo).to.deep.equal({
          name: 'foo',
          version: '0.0.0',
          multiple: false,
          options: {},
          attributes: {
            version: '0.0.0'
          }
        });
        expect(plugins.bar).to.deep.equal({
          name: 'bar',
          version: '1.0.0',
          multiple: false,
          options: {
            key: 'value'
          },
          attributes: {
            version: '1.0.0'
          }
        });
        expect(res.result.connections[1].plugins).to.deep.equal(plugins);
        expect(res.result.connections[2].plugins).to.deep.equal(plugins);
        done();
      });
    });
  });

  it('returns a predictable object', (done) => {
    Server.prepareServer((err, server) => {
      expect(err).to.not.exist();

      const data = server.plugins['hapi-setup'].setup();
      Joi.validate(data, Schema, { presence: 'required' }, (error, value) => {
        expect(error).to.be.null();
        done();
      });
    });
  });

  it('does not enable the UI when passing false', (done) => {
    Server.prepareServer({
      ui: false
    }, (err, server) => {
      expect(err).to.not.exist();
      server.select('public').inject({
        method: 'GET',
        url: '/setup'
      }, (res) => {
        expect(res.statusCode).to.equal(404);
        done();
      });
    });
  });

  it('exposes a view in UI mode', (done) => {
    Server.prepareServer({
      ui: true
    }, (err, server) => {
      expect(err).to.not.exist(err);
      server.select('public').inject({
        url: '/setup'
      }, (res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.headers['content-type']).to.equal('text/html');
        expect(res.headers['content-length']).to.be.above(15000);
        done();
      });
    });
  });
});
