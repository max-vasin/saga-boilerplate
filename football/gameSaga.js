const _ = require('lodash')

// Saga with no business logic leak!
// Yes, its just a function that takes events and generates commands
module.exports = {
  init: () => ({ }),
  'game.created': (ctx, { }, { id: gameId, payload: { expectedPlayers } }) => {
    _.forEach(expectedPlayers, playerId =>
      ctx.command('player', playerId, 'assign', { gameId })
    )
  },
  'player.assigned': (ctx, { }, { id: playerId, payload: { gameId } }) => {
    ctx.command('game', gameId, 'acceptPlayer', { playerId})
  },
  'player.refused': (ctx, { }, { id: playerId, payload: { gameId }}) => {
    ctx.command('game', gameId, 'refusePlayer', { playerId })
  },
  'game.committed': (ctx, { }, { id: gameId }) => {
    ctx.command('game', gameId, 'letsRock')
  },
  'game.cancelled': (ctx, { }, { id: gameId, payload: { acceptedPlayers }}) => {
    _.forEach(acceptedPlayers, playerId =>
      ctx.command('player', playerId, 'finishGame', { gameId })
    )
  }
}
