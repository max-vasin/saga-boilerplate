const _ = require('lodash')

const mockContext = () => ({
  command: jest.fn(),
  query: jest.fn()
})

module.exports = (saga, ...events) => {
  const context = mockContext()
  const state = saga.init(context)

  for (let event of events) {
    const handler = saga[ `${event.aggregate}.${event.name}` ];
    if (_.isFunction(handler)) {
      handler(context, state, event)
    }
  }

  if (_.isFunction(saga['revived']))
    saga['revived'](context, state)

  return {
    context,
    state,
    saga
  }
}
