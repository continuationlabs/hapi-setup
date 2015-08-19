# hapi-setup

[![Current Version](https://img.shields.io/npm/v/hapi-setup.svg)](https://www.npmjs.org/package/hapi-setup)
[![Build Status via Travis CI](https://travis-ci.org/continuationlabs/hapi-setup.svg?branch=master)](https://travis-ci.org/continuationlabs/hapi-setup)
![Dependencies](http://img.shields.io/david/continuationlabs/hapi-setup.svg)
![devDependencies](http://img.shields.io/david/dev/continuationlabs/hapi-setup.svg)

hapi plugin for viewing the server configuration. Provides information such as the version of Node running, the hapi server connections, routing tables per connection, and plugin information.

## Configuration Options

`hapi-setup` supports the following options via the plugin's `register()` function.

### `path`

The endpoint where the plugin will serve HTML. Defaults to `'/hapi-setup'`.

### `dataPath`

The endpoint where the plugin will serve JSON. Defaults to `'/hapi-setup/data'`.

## Response

The plugin's data endpoint returns JSON in the following format:

- `runtime` - Object. Contains information about the Node process.
  - `versions` - Object. The version of Node, as well as Node's dependencies.
  - `execPath` - String. The path to the Node executable.
  - `argv` - Array of strings. Command line arguments used to start the server.
  - `execArgv` - Array of strings. Command line options passed to Node.
  - `env` - Object. Environment variables of the running process.
- `connections` - Array of objects. Contains information about individual hapi server connections. Each object contains the following keys.
  - `uri` - String. URI of the connection.
  - `labels` - Array of strings. Contains the labels associated with the connection.
  - `routes` - Array of objects. Each object represents a route registered on the connection, and contains the following keys.
    - `method` - String. HTTP verb of the route.
    - `path` - String. Path of the route.
    - `plugin` - String or `null`. The name of the plugin that registered the route. If a plugin did not register the route, then this is `null`.
  - `plugins` - Object. Each key represents the name of a registered plugin, and contains the following keys.
    - `name` - String. The name of the plugin.
    - `version` - String. The version of the plugin.
    - `multiple` - Boolean. `true` if the plugin can be registered multiple times. `false` otherwise.
    - `options` - Object. Contains the options passed to the plugin's `register()` function.
    - `attributes` - Object. Contains the attributes used when registering the plugin. This can include the entire contents of the plugin's `package.json`.
