'use strict'

const _ = require('lodash')
const _providers = {}

exports.configure = async (providers) => {
  if (!_.isArray(providers)) {
    throw new Error('provider configuration is expected to be an array')
  }

  await Promise.all(providers.map(async (provider) => {
    _providers[provider.name] = await require('./' + provider.type).configure(provider.config)
  }))

  return _providers
}

exports.get = (name) => _providers[name]
