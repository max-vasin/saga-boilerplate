module.exports = {
  name: 'scheduler',
  commands: {
    schedule: ({ }, { timeSpan, aggregate, id, command, payload }) => ({
      name: 'scheduled',
      payload: {
        timeSpan,
        aggregate,
        id,
        command,
        payload
      }
    }),
    execute: ({ exists }) => {
      if (exists) {
        return {
          name: 'executed',
          payload: { }
        }
      }
    }
  },
  state: {
    init: () => ({
      exists: false
    }),
    scheduled: (state) => ({
      ...state,
      exists: true
    }),
    executed: (state) => ({
      ...state,
      exists: false
    })
  }
}
