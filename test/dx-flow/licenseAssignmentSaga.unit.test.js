const nanoid = require('nanoid')
const createTester = require('../../base/sagaTester')
const saga = require('../../dx-flow/licenseAssignmentSaga')

jest.mock('../../effects/mailbox', () => ({
  send: jest.fn()
}))

const mailbox = require('../../effects/mailbox')

describe('licenceAssignmentSaga', () => {
  afterEach(() => {
    mailbox.send.mockClear()
  })

  test('valid email should be sent to a registered user', () => {
    const tester = createTester(
      saga, {
        aggregate: 'user',
        name: 'registered',
        id: 'user-id',
        payload: { email: 'john@smith.com' }
      }, {
        aggregate: 'license',
        name: 'assigned',
        id: 'license-id',
        payload: { assigneeEmail: 'john@smith.com' }
      }
    )

    expect(mailbox.send).toHaveBeenCalledWith('john@smith.com', 'license license-id have been assigned to you')
    expect(tester.context.command).not.toHaveBeenCalled()
  })

  test('user activation should be requested if user not exist', () => {
    nanoid.mockReturnValueOnce('stealth-user')
    const tester = createTester(
      saga, {
        aggregate: 'license',
        name: 'assigned',
        id: 'license-id',
        payload: { assigneeEmail: 'john@smith.com' }
      }
    )

    expect(mailbox.send).not.toHaveBeenCalled()
    expect(tester.context.command).toHaveBeenCalledWith('user', 'stealth-user', 'requestActivation')
    expect(tester.context.command).toHaveBeenCalledWith('scheduler', 'nano-id', 'schedule', {
      aggregate: 'user',
      command: 'checkDeadLetter',
      id: 'stealth-user',
      timeSpan: 2592000

    })
  })

  test('licenses of destroyed user should be returned to their owners', () => {
    nanoid.mockReturnValueOnce('stealth-user')
    const tester = createTester(
      saga, {
        aggregate: 'license',
        name: 'assigned',
        id: 'license-id',
        payload: { assigneeEmail: 'john@smith.com' }
      }, {
        aggregate: 'user',
        name: 'destroyed',
        id: 'stealth-user'
      }
    )

    expect(tester.context.command).toHaveBeenCalledWith('license', 'license-id', 'return')
  })

  test('activation email should be sent to stealth user', () => {
    const tester = createTester(
      saga, {
        aggregate: 'user',
        name: 'activationRequested',
        id: 'stealth-user',
        payload: {
          email: 'john@smith.com'
        }
      }
    )

    expect(mailbox.send).toHaveBeenCalledWith('john@smith.com', 'please activate your account')
  })
})
