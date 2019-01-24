const createTester = require('../../base/aggregateTester')
const aggregate = require('../../dx-flow/licenseAggregate')

describe('licenseAggregate', () => {
  describe('create', () => {
    test('successfully created with specified type', () => {
      const tester = createTester(aggregate)
      expect(tester.command('create', { type: 'personal' })).toEqual({
        name: 'created',
        payload: {
          type: 'personal'
        }
      })
    })

    test('created with enterprise type by default', () => {
      const tester = createTester(aggregate)
      expect(tester.command('create', { })).toEqual({
        name: 'created',
        payload: {
          type: 'enterprise'
        }
      })
    })

    test('cannot be created multiple times', () => {
      const tester = createTester(aggregate, {
        name: 'created',
        payload: { type: 'personal' }

      })
      expect(tester.command('create')).toBeUndefined()
    })
  })

  describe('sell', () => {
    test('available license should be sold to specified customer', () => {
      const tester = createTester(aggregate, {
        name: 'created',
        payload: {
          type: 'personal'
        }
      })
      expect(tester.command('sell', { userId: 'user-id' })).toEqual({
        name: 'sold',
        payload: {
          userId: 'user-id'
        }
      })
    })

    test('unavailable license cannot be sold', () => {
      const tester = createTester(aggregate)
      expect(tester.command('sell', { userId: 'user-id' })).toBeUndefined()
    })

    test('already sold license cannot be sold again', () => {
      const tester = createTester(aggregate, {
        name: 'created',
        payload: {
          type: 'personal'
        }
      }, {
        name: 'sold',
        payload: {
          userId: 'user-id'
        }
      })
      expect(tester.command('sell', { userId: 'user-id' })).toBeUndefined()
    })

    test('assigned license cannot be sold', () => {
      const tester = createTester(aggregate, {
        name: 'created',
        payload: {
          type: 'personal'
        }
      }, {
        name: 'sold',
        payload: {
          userId: 'user-id'
        }
      }, {
        name: 'assigned',
        payload: {
          assigneeId: 'assignee-id'
        }
      })
      expect(tester.command('sell', { userId: 'user-id' })).toBeUndefined()
    })
  })

  describe('assignByEmail', () => {
    test('sold license should be assigned to specified email', () => {
      const tester = createTester(aggregate, {
        name: 'created',
        payload: {
          type: 'personal'
        }
      }, {
        name: 'sold',
        payload: {
          userId: 'user-id'
        }
      })
      expect(tester.command('assignByEmail', { email: 'john@smith.com' })).toEqual({
        name: 'assigned',
        payload: {
          ownerId: 'user-id',
          assigneeEmail: 'john@smith.com'
        }
      })
    })

    test('available license cannot be assigned', () => {
      const tester = createTester(aggregate, {
        name: 'created',
        payload: {
          type: 'personal'
        }
      })
      expect(tester.command('assignByEmail', { email: 'lara@croft.com' })).toBeUndefined()
    })

    test('already assigned license cannot be reassigned', () => {
      const tester = createTester(aggregate, {
        name: 'created',
        payload: {
          type: 'personal'
        }
      }, {
        name: 'sold',
        payload: {
          userId: 'user-id'
        }
      }, {
        name: 'assigned',
        payload: {
          email: 'john@smith.com'
        }
      })
      expect(tester.command('assignByEmail', { email: 'lara@croft.com' })).toBeUndefined()
    })

    test('returned license can be assigned again', () => {
      const tester = createTester(aggregate, {
        name: 'created',
        payload: {
          type: 'personal'
        }
      }, {
        name: 'sold',
        payload: {
          userId: 'user-id'
        }
      }, {
        name: 'assigned',
        payload: {
          email: 'john@smith.com'
        }
      }, {
        name: 'returned'
      })
      expect(tester.command('assignByEmail', { email: 'lara@croft.com' })).toEqual({
        name: 'assigned',
        payload: {
          ownerId: 'user-id',
          assigneeEmail: 'lara@croft.com'
        }
      })
    })
  })

  describe('return', () => {
    // same approach as above
  })
})
