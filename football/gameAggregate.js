const _ = require('lodash')

module.exports = {
  name: 'game',
  commands: {
    create: ({ }, { expectedPlayers }) => ({
      name: 'created',
      payload: {
        expectedPlayers
      }
    }),
    acceptPlayer: ({ expectedPlayers, acceptedPlayers }, { playerId }) => {
      if (_.includes(expectedPlayers, playerId)) {
        if (!_.includes(acceptedPlayers, playerId)) {
          // Begin logic leaking due to one event per command
          // Instead we can have something like this.emit(...) and continue logic
          return {
            name: 'playerAccepted',
            payload: {
              playerId
            }
          }
        }
      }
      return new Error(`player ${playerId} was not invited to the party`)
    },

    // This command called by gameLogicLeakSaga each time playerAccepted event generated
    // Its logic should be injected directly into acceptPlayer,
    // but because 'one event per command feature' it causes leak to external saga
    // Code IMPLICIT complexity goes to avalanches of the mountains
    commit: ({ expectedPlayers, acceptedPlayers }, { }) => {
      if (!_.difference(expectedPlayers, acceptedPlayers).length)
        return {
          name: 'committed',
          payload: {}
        }
    },
    letsRock: ({ }, { }) => ({
      name: 'started',
      payload: { }
    })
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
