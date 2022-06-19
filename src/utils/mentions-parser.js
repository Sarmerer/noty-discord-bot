/**
 * @param {string} text
 * @returns {string[]}
 */
function parseUserMentionSequence(text) {
  const split = text.split(' ').map((m) => m.trim())
  if (!split.length) return []

  return split.reduce((acc, m) => {
    const userId = parseUserMention(m)
    if (userId) {
      acc.push(userId)
    }

    return acc
  }, [])
}

/**
 *
 * @param {string} mention
 * @returns {string|null}
 */
function parseUserMention(mention) {
  if (mention.startsWith('<@') && mention.endsWith('>')) {
    mention = mention.slice(2, -1)

    if (mention.startsWith('!')) {
      mention = mention.slice(1)
    }

    return mention
  }

  return null
}

module.exports = {
  parseUserMention,
  parseUserMentionSequence,
}
