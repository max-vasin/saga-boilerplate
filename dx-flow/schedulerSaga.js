const _ = require('lodash')
const date = require('date-and-time')

module.exports = {
  init: () => ({
    entries: new Map()
  }),
  'scheduler.scheduled': (ctx, { entries }, {
    id:taskId,
    timestamp,
    payload: {
      timeSpan,
      aggregate,
      id,
      command,
      payload
    }
  }) => {
    entries.set(taskId, {
      taskId,
      startAt: date.addSeconds(timestamp, timeSpan),
      aggregate,
      id,
      command,
      payload
    })
  },
  'scheduler.completed': (ctx, {}, { id }) => {
    entries.remove(id)
  }
}
