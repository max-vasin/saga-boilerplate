module.exports = () => {
  const events = []

  return {
    getAggregateEvents: (name, id) => {
      const result = events.filter(e => (e.aggregate === name && e.id === id))
      result.sort((e1, e2) => e1.version > e2.version)
      return result
    },
    pushEvents: toPush => {
      events.push(...toPush)
    }
  }
}
