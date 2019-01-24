const nanoid = require('nanoid')

module.exports = {
  name: 'user',
  commands: {
    register: ({ status }, { email }) => {
      if (status === 'not-existing') {
        return {
          name: 'registered',
          payload: {
            email
          }
        }
      }
    },
    requestActivation: ({ status }, { email }) => {
      if (status === 'not-existing') {
        return {
          name: 'activationRequested',
          payload: {
            email,
            confirmationCode: nanoid()
          }
        }
      }
    },
    confirmActivation: ({ status, confirmationCode, email }, { code }) => {
      if (status === 'not-confirmed' && code === confirmationCode) {
        return {
          name: 'registered',
          payload: {
            email
          }
        }
      }
    },
    checkDeadLetter: ({ status }) => {
      if (status === 'not-confirmed') {
        return {
          name: 'destroyed',
          payload: { }
        }
      }
    }
  },
  state: {
    init: () => ({
      status: 'not-existing'
    }),
    registered: (state) => ({
      ...state,
      status: 'active'
    }),
    activationRequested: (state, { payload: { confirmationCode, email }}) => ({
      ...state,
      status: 'not-confirmed',
      confirmationCode,
      email
    }),
    destroyed: (state) => ({
      ...state,
      status: 'not-existing'
    })
  }
}
