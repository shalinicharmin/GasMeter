import { combineReducers } from "@reduxjs/toolkit"
import userSessionReducer from "./userSessionReducer"

const rootReducer = combineReducers({
  userSession: userSessionReducer
})

export default rootReducer
