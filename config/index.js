const config = require('./config.json')

module.exports = {
  get(...keys) {
    if (!keys.length) return {}
    return keys.length > 1
      ? keys.reduce((res, key) => {
          res[key] = config[key]
          return res
        }, {})
      : config[keys[0]]
  },
  has(key) {
    return config.hasOwnProperty(key)
  },
  isEmpty(key) {
    return !!config[key]
  },
}
