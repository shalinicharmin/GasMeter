import { SET_SESSION_DATA, GET_SESSION_DATA } from "../actions/userSessionAction"

const initialState = {
  userSession: null
}

const userSessionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SESSION_DATA:
      return {
        ...state,
        userSession: action.payload
      }
    case GET_SESSION_DATA:
      return {
        ...state
      }
    default:
      return state
  }
}

// const userSessionDataReducer =()

export default userSessionReducer
