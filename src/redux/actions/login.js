// ** UseJWT import to get config
import useJwt from "../../utils/auth/jwt/useJwt"
const config = useJwt.jwtConfig

export const handleLogin = (data) => {
  console.log(useJwt.jwtConfig)
  // console.log('Data ....')
  // // console.log(data)
  // console.log(data.default_route)

  return (dispatch) => {
    dispatch({
      type: "LOGIN",
      data,
      config,
      ["accessToken"]: data["accessToken"],
      ["refreshToken"]: data["refreshToken"]
    })

    // ** Add to user, accessToken & refreshToken to localStorage
    // if (data.default_route) {
    //   localStorage.setItem('default_route', data.default_route)
    // }
    // } else {
    //   localStorage.setItem('default_route', undefined)
    // }

    // localStorage.setItem('userData', JSON.stringify(data))
    localStorage.setItem("accessToken", data.accessToken)
    localStorage.setItem("refreshToken", data.refreshToken)
    localStorage.setItem("uniqueId", data.unique_id)
  }
}
