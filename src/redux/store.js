import rootReducer from "./reducers/rootReducer" // Assuming you have your rootReducer
import { configureStore } from "@reduxjs/toolkit"

const store = configureStore({
  reducer: rootReducer
})

export default store
