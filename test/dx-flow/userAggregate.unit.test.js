const nanoid = require('nanoid')
const createTester = require('../../base/aggregateTester')
const aggregate = require('../../dx-flow/userAggregate')

describe('userAggregate', () => {
  describe('register', () => {
    test('successfully registered if not exist', () => {
      const tester = createTester(aggregate)
      expect(tester.command('register', { email: 'john@smith.com' })).toEqual({
        name: 'registered',
        payload: {
          email: 'john@smith.com'
        }
      })
    })

    test('avoid registration if already exist', () => {
      const tester = createTester(aggregate, {
        name: 'registered',
        payload: {
          email: 'john@smith.com'
        }
      })
      expect(tester.command('register', { })).toBeUndefined()
    })

    test('can be re-registered if deleted', () => {
      const tester = createTester(aggregate, {
        name: 'registered',
        payload: {
          email: 'john@smith.com'
        }
      }, {
        name: 'destroyed'
      })

      expect(tester.command('register', { email: 'john@smith.com' })).toEqual({
        name: 'registered',
        payload: {
          email: 'john@smith.com'
        }
      })
    })
  })

  describe('requestActivation', () => {
    test('activation requested if user not exist', () => {
      nanoid.mockReturnValueOnce('activation-code')
      const tester = createTester(aggregate)
      expect(tester.command('requestActivation', { email: 'john@smith.com' })).toEqual({
        name: 'activationRequested',
        payload: {
          email: 'john@smith.com',
          confirmationCode: 'activation-code'
        }
      })
    })

    test('no activation request if user already exists', () => {
      const tester = createTester(aggregate, {
        name: 'registered',
        payload: {
          email: 'john@smith.com'
        }
      })
      expect(tester.command('requestActivation', { email: 'john@smith.com' })).toBeUndefined()
    })

    test('no duplicate activation requests', () => {
      const tester = createTester(aggregate, {
        name: 'activationRequested',
        payload: {
          email: 'john@smith.com',
          confirmationCode: 'activation-code'
        }
      })
      expect(tester.command('requestActivation', { email: 'john@smith.com' })).toBeUndefined()
    })
  })

  describe('confirmActivation', () => {
    test('user registered if confirmation was requested and code is correct', () => {
      const tester = createTester(aggregate, {
        name: 'activationRequested',
        payload: {
          email: 'john@smith.com',
          confirmationCode: 'activation-code'
        }
      })
      expect(tester.command('confirmActivation', { code: 'activation-code' })).toEqual({
        name: 'registered',
        payload: {
          email: 'john@smith.com'
        }
      })
    })

    test('incorrect confirmation code', () => {
      const tester = createTester(aggregate, {
        name: 'activationRequested',
        payload: {
          email: 'john@smith.com',
          confirmationCode: 'activation-code'
        }
      })
      expect(tester.command('confirmActivation', { code: 'wrong-code' })).toBeUndefined()
    })

    test('user already registered cannot be confirmed', () => {
      const tester = createTester(aggregate, {
        name: 'registered',
        payload: {
          email: 'john@smith.com',
        }
      })
      expect(tester.command('confirmActivation', { code: 'activation-code' })).toBeUndefined()
    })

    test('user that not exists cannot be confirmed', () => {
      const tester = createTester(aggregate)
      expect(tester.command('confirmActivation', { code: 'activation-code' })).toBeUndefined()
    })

    test('deleted user cannot be confirmed', () => {
      const tester = createTester(aggregate, {
        name: 'activationRequested',
        payload: {
          email: 'john@smith.com',
          confirmationCode: 'activation-code'
        }
      }, {
        name: 'destroyed'
      })

      expect(tester.command('confirmActivation', { code: 'activation-code' })).toBeUndefined()
    })
  })

  describe('checkDeadLetter', () => {
    test('user should be deleted if not confirmed', () => {
      const tester = createTester(aggregate, {
        name: 'activationRequested',
        payload: {
          email: 'john@smith.com',
          confirmationCode: 'activation-code'
        }
      })

      expect(tester.command('checkDeadLetter')).toEqual({
        name: 'destroyed',
        payload: { }
      })
    })

    test('avoid deleting of registered users', () => {
      const tester = createTester(aggregate, {
        name: 'registered',
        payload: {
          email: 'john@smith.com',
        }
      })

      expect(tester.command('checkDeadLetter')).toBeUndefined()
    })

    test('avoid deleting users that are not exist', () => {
      const tester = createTester(aggregate)
      expect(tester.command('checkDeadLetter')).toBeUndefined()
    })

    test('avoid deleting a user that already deleted', () => {
      const tester = createTester(aggregate, {
        name: 'registered',
        payload: {
          email: 'john@smith.com'
        }
      }, {
        name: 'deleted'
      })
      expect(tester.command('checkDeadLetter')).toBeUndefined()
    })
  })
})
