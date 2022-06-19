const { NotyDatabase } = require('../types/db')
const { Noty } = require('../types/models')

const lowdb = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

class LowdbNotyDatabase extends NotyDatabase {
  constructor(db) {
    super(db)
  }

  async init() {
    this.db_.defaults({ noties: [], indexedUsers: {}, telemetry: {} }).write()
  }

  /**
   * @param {Noty} noty
   * @returns {Promise<LowdbNotyDatabase>}
   */
  async addNoty_(noty) {
    const record = await this.findNoty_({
      triggerUserId: noty.triggerUserId,
      notifiedUserId: noty.notifiedUserId,
    })

    if (record.value()) {
      await record.assign({ modes: noty.modes.minify() }).write()
    } else {
      await this.db_.get('noties').push(noty.toJSON()).write()
    }

    await this.addToIndex_(noty)
    return this
  }

  /**
   * @param {Noty} noty
   */
  async addToIndex_(noty) {
    await this.incrementIndex_(noty.triggerUserId)
    await this.incrementIndex_(noty.notifiedUserId)

    return this
  }

  /**
   * @param {Noty} noty
   */
  async removeFromIndex_(noty) {
    const tuid = await this.incrementIndex_(noty.triggerUserId, -1)
    const nuid = await this.incrementIndex_(noty.notifiedUserId, -1)

    if (tuid < 1) {
      this.db_.get('indexedUsers').unset(noty.triggerUserId).write()
    }

    if (nuid < 1) {
      this.db_.get('indexedUsers').unset(noty.notifiedUserId).write()
    }

    return this
  }

  /**
   * @param {string} userId
   * @returns {Promise<number>}
   */
  async incrementIndex_(userId, amount = 1) {
    this.db_
      .get('indexedUsers')
      .update(userId, (value) => (value ? value + amount : amount))
      .write()

    return this.db_.get('indexedUsers').get(userId).value()
  }

  /**
   * @param {string} triggerUserId
   * @returns {Promise<Noty[]>}
   */
  async getNotiesByTriggerUserId_(triggerUserId) {
    const index = this.db_.get('indexedUsers').get(triggerUserId).value()
    if (!index) return []

    const records = await this.filterNoties_({ triggerUserId })
    const value = records.value()
    if (!value?.length) return []

    return value.map((record) => new Noty(record))
  }

  /**
   * @param {string} notifiedUserId
   * @returns {Promise<Noty[]>}
   */
  async getNotesByNotifiedUserId(notifiedUserId) {
    const index = this.db_.get('indexedUsers').get(notifiedUserId).value()
    if (!index) return []

    const records = await this.filterNoties_({ notifiedUserId })
    const value = records.value()
    if (!value?.length) return []

    return value.map((record) => new Noty(record))
  }

  /**
   * @param {Noty} noty
   * @returns {Promise<LowdbNotyDatabase>}
   */
  async removeNoty_(noty) {
    const removedRecords = this.db_
      .get('noties')
      .remove({
        triggerUserId: noty.triggerUserId,
        notifiedUserId: noty.notifiedUserId,
      })
      .write()

    if (removedRecords?.length) {
      await this.removeFromIndex_(noty)
    }

    return this
  }

  /**
   * @param {string} userId
   */
  async removeUserRelatedData_(userId) {
    const asTrigger = await this.filterNoties_({
      triggerUserId: userId,
    })

    const asNotified = await this.filterNoties_({
      notifiedUserId: userId,
    })

    const records = [...asTrigger.value(), ...asNotified.value()]
    if (!records?.length) return

    for (const record of records) {
      await this.removeNoty_(record)
    }
  }

  /**
   * @param {string} guildId
   */
  async removeGuildRelatedData_(guildId) {
    const noties = await this.filterNoties_({
      guildId,
    })

    const notyRecords = noties.value()
    if (!notyRecords?.length) return

    for (const noty of notyRecords) {
      await this.removeNoty_(noty)
    }
  }

  /**
   *
   * @param {object} query
   * @returns {Promise<lowdbFindResult>}
   */
  async findNoty_(query) {
    return this.db_.get('noties').find(query)
  }

  /**
   * @param {object} query
   * @returns {Promise<lowdbFilterResults>}
   */
  async filterNoties_(query) {
    return this.db_.get('noties').filter(query)
  }

  /**
   * @param {string} pathToFile
   * @returns {LowdbNotyDatabase}
   */
  static fromFilePath(pathToFile) {
    try {
      const adapter = new FileSync(pathToFile)
      const db = lowdb(adapter)
      return new LowdbNotyDatabase(db)
    } catch (error) {
      throw new Error(`Failed create lowdb instance: ${error}`)
    }
  }

  /* ------------------------------- telemetry; ------------------------------- */

  async onGuildCreate_() {
    this.incrementTelemetry_('guildsCreated')
  }

  async onGuildDelete_() {
    this.incrementTelemetry_('guildsDeleted')
  }

  async onNotyCreate_() {
    this.incrementTelemetry_('notiesCreated')
  }

  async onNotyDelete_() {
    this.incrementTelemetry_('notiesDeleted')
  }

  async incrementTelemetry_(key) {
    this.db_
      .get('telemetry')
      .update(key, (value) => {
        return value ? value + 1 : 1
      })
      .write()
  }
}

module.exports = { LowdbNotyDatabase }
