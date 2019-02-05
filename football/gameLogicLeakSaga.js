// game aggregate logic leak
module.exports = {
  init: () => ({ }),
  'game.playerAccepted': (ctx, { }, { id }) => {
    // 1. logic leak
    // 2. increases IMPLICIT business logic complexity
    // 3. waste of resources
    ctx.command('game', id, 'commit')
  }
}
