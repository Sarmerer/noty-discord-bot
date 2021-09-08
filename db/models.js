export class Guild {
  /**
   * @param {object} payload payload
   * @param {string} payload.id discord id of a guild
   * @param {string} payload.channel default notification channel id
   */
  constructor(payload = {}) {
    Object.assign(this, payload)
    return this
  }
}
export class Stalk {
  /**
   * @param {object}} payload
   * @param {string} payload.id discord id of a stalker
   * @param {string} payload.target discord id of a target
   * @param {string} payload.guildID discord id of a guild
   * @param {string} payload.channel discord id of a notifications channel
   * @param {number} payload.debounce minimal time between notifications in seconds
   * @param {string} payload.mode notifications mode
   * @param {boolean} payload.notag whether to send notifications with no stalker tag
   * @param {boolean} payload.dnd whether to send notifications when stalker is offline, or in dnd mode
   *
   * @default payload.debounce = 30
   * @default payload.mode = 'online'
   * @default payload.notag = false
   * @default payload.dnd = false
   *
   */
  constructor(payload = {}) {
    Object.assign(this, payload)
    return this
  }
}
