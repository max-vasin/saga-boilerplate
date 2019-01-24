const _ = require('lodash')
const nanoid = require('nanoid')
const mailbox = require('../effects/mailbox')

module.exports = {
  init: () => ({
    licenseIndex: new Map(),
    userIndex: new Map()
  }),
  'user.registered': (ctx, { userIndex }, { id, payload: { email } }) => {
    userIndex.set(email, id)
  },
  'license.assigned': (ctx, { licenseIndex, userIndex }, { id, payload: { assigneeEmail } }) => {
    let userId = userIndex.get(assigneeEmail)
    if (!userId) {
      userId = nanoid()
      ctx.command('user', userId, 'requestActivation')
      ctx.command('scheduler', nanoid(), 'schedule', {
        aggregate: 'user',
        id: userId,
        command: 'checkDeadLetter',
        timeSpan: 2592000 // approx a month in secs
      })
    } else {
      mailbox.send(assigneeEmail, `license ${id} have been assigned to you`)
    }

    const licenses = licenseIndex.get(userId) || []
    licenses.push(id)
    licenseIndex.set(userId, licenses)
  },
  'user.activationRequested': (ctx, { userIndex }, { id, payload: { email } }) => {
    userIndex.set(email, id)
    mailbox.send(email, `please activate your account`)
  },
  'user.destroyed': (ctx, { licenseIndex, userIndex }, { id }) => {
    _.forEach(licenseIndex.get(id), (licenseId) => ctx.command('license', licenseId, 'return'))
    userIndex.delete(id)
  }
}
