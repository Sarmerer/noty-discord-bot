const { Noty } = require('./models')

class Database {
  constructor(db) {
    this.db_ = db
  }
}

class NotyDatabase extends Database {
  constructor(db) {
    super(db)
  }

  validateNoty_(noty) {
    if (noty instanceof Noty) return true

    throw new Error(`noty must be an instance of ${Noty.name}`)
  }

  async init() {
    throw new Error('This class is meant to be extended by an implementation')
  }

  throwNotImplemented_() {
    throw new Error('This class is meant to be extended by an implementation')
  }

  async addNoty(noty) {
    this.validateNoty_(noty)

    await this.addNoty_(noty)
    return this
  }

  async addNoty_(noty) {
    this.throwNotImplemented_()
  }

  async removeNoty(noty) {
    this.validateNoty_(noty)

    await this.removeNoty_(noty)
  }

  async removeNoty_(noty) {
    this.throwNotImplemented_()
  }

  async getNotiesByTriggerUserId(triggerUserId) {
    return this.getNotiesByTriggerUserId_(triggerUserId)
  }

  async getNotiesByTriggerUserId_(triggerUserId) {
    this.throwNotImplemented_()
  }

  async getNotesByNotifiedUserId(notifiedUserId) {
    return this.getNotesByNotifiedUserId_(notifiedUserId)
  }

  async getNotesByNotifiedUserId_(notifiedUserId) {
    this.throwNotImplemented_()
  }

  async removeUserRelatedData(userId) {
    await this.removeUserRelatedData_(userId)
  }

  async removeUserRelatedData_(userId) {
    this.throwNotImplemented_()
  }

  async removeGuildRelatedData(guildId) {
    await this.removeGuildRelatedData_(guildId)
  }

  async removeGuildRelatedData_(guildId) {
    this.throwNotImplemented_()
  }

  /* ------------------------------- telemetry; ------------------------------- */

  async onGuildCreate() {
    await this.onGuildCreate_()
  }

  async onGuildCreate_() {
    console.warn('onGuildCreate telemetry is not implemented')
  }

  async onGuildDelete() {
    await this.onGuildDelete_()
  }

  async onGuildDelete_() {
    console.warn('onGuildDelete telemetry is not implemented')
  }

  async onNotyCreate() {
    await this.onNotyCreate_()
  }

  async onNotyCreate_() {
    console.warn('onNotyCreate telemetry is not implemented')
  }

  async onNotyDelete() {
    await this.onNotyDelete_()
  }

  async onNotyDelete_() {
    console.warn('onNotyDelete telemetry is not implemented')
  }
}

module.exports = { Database, NotyDatabase }
