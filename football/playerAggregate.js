module.exports = {
  name: 'player',
  commands: {
    create: ({ }, {  }) => {
      if (status === 'available') {
        return {
          name: 'created',
          payload: { }
        }
      }
    },
    assign: ({ status, assignedGameId  }, { gameId }) => {
      switch (status) {
        case 'not-exist':
          return new Error('not found')

        case 'available':
          return {
            name: 'assigned',
            payload: {
              gameId
            }
          }

        case 'busy':
          if (gameId !== assignedGameId)
            return new Error('player is busy')
          break
      }
    },
    finishGame: ({ status, assignedGameId }, { gameId }) => {
      switch (status) {
        case 'not-exist':
          return new Error('not exist')

        case 'available':
          return new Error('user is not assigned to any game')

        case 'busy':
          if (assignedGameId !== gameId)
            return new Error(`user assigned to another game ${assignedGameId}`)
          return {
            name: 'finishedGame',
            payload: {
              gameId
            }
          }
      }
    }
  },
  state: {
    init: () => ({
      status: 'not-exist',
      assignedGameId: null
    }),
    created: (state) => ({
      ...state,
      status: 'available',
    }),
    assigned: (state, { payload: { gameId } }) => ({
      ...state,
      status: 'busy',
      assignedGameId: gameId
    }),
    finishedGame: (state) => ({
      ...state,
      status: 'available',
      assignedGameId: null
    })
  }
}
