class NotyModes {
  /**
   * @param {object} modes
   * @param {boolean} modes.[mode] - Whether to notify when the user is in the given mode.
   */
  constructor(options) {
    const available = NotyModes.available()
    this.modes_ = available.reduce((acc, key) => {
      acc[key] = options?.[key] || false
      return acc
    }, {})
  }

  static available() {
    return ['online', 'offline', 'idle', 'dnd', 'any']
  }

  minify() {
    if (this.modes_.any) return { any: true }

    return Object.keys(this.modes_).reduce((acc, key) => {
      if (this.modes_[key]) {
        acc[key] = true
      }
      return acc
    }, {})
  }

  has(mode) {
    if (this.modes_.any) return true

    return this.modes_[mode]
  }

  get length() {
    return Object.keys(this.minify()).length
  }
}

class Noty {
  /**
   * @param {object} options
   * @param {string} options.triggerUserId
   * @param {string} options.notifiedUserId
   * @param {string} options.guildId
   * @param {NotyModes} options.modes
   */
  constructor(options) {
    /** @type {string} */
    this.triggerUserId = options.triggerUserId

    /** @type {string} */
    this.notifiedUserId = options.notifiedUserId

    /** @type {string} */
    this.guildId = options.guildId

    /** @type {NotyModes} */
    this.modes = null
    if (options.modes instanceof NotyModes) {
      this.modes = options.modes
    } else {
      this.modes = new NotyModes(options.modes)
    }

    return this
  }

  setModes(modes) {
    this.modes = new NotyModes(modes)
    return this
  }

  hasMode(mode) {
    return !!this.modes.has(mode)
  }

  toJSON() {
    return {
      triggerUserId: this.triggerUserId,
      notifiedUserId: this.notifiedUserId,
      guildId: this.guildId,
      modes: this.modes.minify(),
    }
  }
}

module.exports = { Noty, NotyModes }
