const _ = require('lodash')

module.exports = (aggregate, ...events) => {
  let state = aggregate.state.init()

  for (let event of events) {
    const handler = aggregate.state[ event.name ];
    if (_.isFunction(handler)) {
      state = handler(state, event)
    }
  }

  return {
    state,
    aggregate,
    command: (name, payload) => {
      const handler = aggregate.commands[name]
      if (_.isFunction(handler)) {
        const event = handler(state, payload || { })
        if (event) {
          const eventHandler = aggregate.state[ event.name ]
          if (_.isFunction(eventHandler)) {
            state = eventHandler(state, event)
          }
        }
        return event
      }
      throw new Error(`no such command ${name}`)
    }
  }
}
