const _ = require('lodash')
const createEventStore = require('./eventStore')

module.exports = () => {
  const eventStore = createEventStore()
  const aggregates = new Map()
  const sagas = []
  const readModels = []

  return {
    repository,
    eventStore,
    bindAggregate: (a) => {
      aggregates.set(a.name, a)
    },
    bindSaga: (s) => {
      sagas.push(s)
    },
    bindReadModel: (r) => {
      readModels.push(r)
    },
    command: (aggregateName, id, command, payload) => {
      const events = eventStore.getAggregateEvents(aggregateName, id)
      const aggregate = aggregates.get(aggregateName)['allocate']()
      let state = aggregate.state.init()
      for (let event of events) {
        state = aggregate.state[ event.name ](state, event)
      }
      const generatedEvents = [].concat(aggregate.commands[command](state, payload))
      let version = events[events.length - 1].version
      for (let event of generatedEvents) {
        event.aggregate = aggregateName
        event.id = id
        event.version = ++version
      }
      eventStore.pushEvents(generatedEvents)
      for (let event of generatedEvents) {
        for (let saga of sagas) {
          const handler = saga[`${event.aggregate}.${event.name}`];
          if (_.isFunction(handler))
            handler(event)
        }
      }
      for (let event of generatedEvents) {
        for (let readModel of readModels) {
          const handler = readModel[`${event.aggregate}.${event.name}`];
          if (_.isFunction(handler))
            handler(event)
        }
      }
    },
    query: (queryName, params) => {
      for (let readModel in readModels) {
        const handler = readModel[queryName];
        if (_.isFunction(handler))
          return handler(params)
      }
      return null
    }
  }
}
