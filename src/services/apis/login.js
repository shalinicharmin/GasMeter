import axios from "axios"
import { rawInstance, tokenInstance } from "../baseApi"

// login call without tokenInstance
export const login = async (body) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_BASE_URL}/${process.env.REACT_APP_LOGIN_URL}/users/auth/login/`,
      body
    )
    console.log(response.data.data.result)
    return response
  } catch (error) {
    console.error("Error fetching data:", error)
  }
}
