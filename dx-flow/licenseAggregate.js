module.exports = {
  name: 'license',
  commands: {
    create: ({ status }, { type = 'enterprise' }) => {
      if (status === 'unavailable') {
        return {
          name: 'created',
          payload: {
            type
          }
        }
      }
    },
    sell: ({ status }, { userId }) => {
      if (status === 'available') {
        return {
          name: 'sold',
          payload: {
            userId
          }
        }
      }
    },
    assignByEmail: ({ status, ownerId }, { email }) => {
      if (status === 'sold') {
        return {
          name: 'assigned',
          payload: {
            ownerId,
            assigneeEmail: email
          }
        }
      }
    },
    return: ({ status, assigneeId, ownerId }, {}) => {
      if (status === 'assigned') {
        return {
          name: 'returned',
          payload: {
            ownerId,
            assigneeId
          }
        }
      }
    }
  },
  state: {
    init: () => ({
      status: 'unavailable'
    }),
    created: (state) => ({
      ...state,
      status: 'available',
    }),
    sold: (state, { payload: { userId }}) => ({
      ...state,
      status: 'sold',
      ownerId: userId
    }),
    assigned: (state, { payload: { assigneeId } }) => ({
      ...state,
      status: 'assigned',
      assigneeId
    }),
    returned: (state) => ({
      ...state,
      status: 'sold',
      assigneeId: null
    })
  }
}
