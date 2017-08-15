const cm = require('./connectionManager')
const db = require('./db')

exports.configure = async (config) => {
  cm.init(config)
  return db
}
