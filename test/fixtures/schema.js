var Joi = require('joi');

module.exports = Joi.object().keys({
  runtime: Joi.object({
    argv: Joi.array().items(Joi.string()).sparse(),
    cwd: Joi.string(),
    env: Joi.object().unknown(true).pattern(/.+/, Joi.string().allow('')),
    execPath: Joi.string(),
    execArgv: Joi.array().items(Joi.string()).sparse(),
    versions: Joi.object().unknown(true).pattern(/.+/, Joi.string().allow(''))
  }),
  connections: Joi.array().items(Joi.object({
    uri: Joi.string(),
    labels: Joi.array().items(Joi.string().allow('')).sparse(),
    routes: Joi.array().items(Joi.object()).sparse(),
    plugins: Joi.object().unknown(true).pattern(/.+/, Joi.object().keys({
      name: Joi.string(),
      version: Joi.string(),
      multiple: Joi.boolean()
    }).unknown(true))
  }))
});
