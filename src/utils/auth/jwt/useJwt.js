// ** JWT Service Import
import JwtService from "./jwtService"

// ** Export Service as useJwt
export default function useJwt(jwtOverrideConfig) {
  console.log(jwt)
  const jwt = new JwtService(jwtOverrideConfig)
  return {
    jwt
  }
}
