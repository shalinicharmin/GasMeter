import dayjs from "./dayjs"
import { isEmpty, jsonParse } from "./commonFunction"

// session Permission Tokens

export const setTokenData = (profileData) => {
  if (typeof Storage !== "undefined") {
    //remove old Session before set new session
    removeTokenData()

    sessionStorage.setItem("profile", JSON.stringify(profileData))
    if (profileData?.rememberMe !== undefined && profileData?.rememberMe === true) {
      localStorage.setItem("lsprofile", JSON.stringify(profileData))
    }
  }
}

export const setRedirectionCookie = () => {
  if (typeof document !== "undefined") {
    document.cookie = "a=1; path=/"
  }
}

export const removeTokenData = () => {
  if (typeof Storage !== "undefined") {
    sessionStorage.removeItem("profile")
    localStorage.removeItem("lsprofile")
    if (typeof document !== "undefined") {
      document.cookie = "a=0; path=/"
    }
  }
}

export const getTokenData = () => {
  if (typeof Storage !== "undefined") {
    try {
      if (sessionStorage && sessionStorage.getItem("profile") !== null) {
        return jsonParse(sessionStorage.getItem("profile"))
      } else if (typeof localStorage != "undefined" && localStorage.getItem("lsprofile") !== null) {
        let sessionStorageTokenData = jsonParse(localStorage.getItem("lsprofile"))
        if (sessionStorageTokenData?.role === "M") {
          sessionStorageTokenData["set_remembered_token"] = 1
        }
        setTokenData(sessionStorageTokenData)
        return jsonParse(sessionStorage.getItem("profile"))
      }
    } catch (error) { }
  }
  return null
}

export const getAuthtoken = () => {
  return getTokenData()?.AuthToken
}
export const getGenderPreference = (withAll = false) => {
  // let gender = getCookie("selectedgender")
  // if (gender === "all" && withAll == false) {
  //   gender = ""
  // }
  // return gender
}

export const updateGenderPreferenceInSessionData = (new_gender_preference) => {
  let d = new Date()
  d.setTime(d.getTime() + 30 * 24 * 60 * 60 * 1000)
  let expires = "expires=" + d.toUTCString()
  document.cookie = `selectedgender=${new_gender_preference};` + expires + ";path=/"

  let tokenData = getTokenData()

  if (!isEmpty(tokenData)) {
    tokenData.gender_preference = new_gender_preference
    setTokenData(tokenData)
  }
}

export const getAuthUserId = () => {
  return getTokenData()?.AuthUserId
}

export const checkLoginedIn = () => {
  if (typeof Storage !== "undefined") {
    const loggedInData = sessionStorage.getItem("profile")
    return loggedInData ? true : false
  }
}

export const checkIsUser = () => {
  if (typeof Storage !== "undefined") {
    const loggedInData = jsonParse(sessionStorage.getItem("profile"))
    // console.log('USER or MODEL')
    return loggedInData?.role === "C" ? true : false
  }
}

//used for calling APIs on Re visit ISR page
export const revalidateISRPage = (revalidateDuration) => {
  if (typeof Storage !== "undefined") {
    // for ISR Revalidation from client side API call
    if (getPageLoadTime() === null) {
      resetPageLoadTime()
    }

    let getPageLoadTimeVal = dayjs(new Date(getPageLoadTime()))
    let toDate = dayjs()

    let difference = toDate.diff(getPageLoadTimeVal, "seconds")
    console.log(difference, "difference")
    if (difference > revalidateDuration) {
      resetPageLoadTime()
      return true
    }
  }
  return false
}

export const destroySession = () => {
  localStorage.setItem("DESTROY_SESSION", dayjs().toString())
  localStorage.removeItem("DESTROY_SESSION")
}

export const getPageLoadTime = () => {
  if (typeof Storage !== "undefined" && sessionStorage) {
    return sessionStorage.getItem("reloadTime")
  }
  return false
}

export const resetPageLoadTime = () => {
  if (typeof Storage !== "undefined" && sessionStorage) {
    sessionStorage.setItem("reloadTime", dayjs().toString())
  }
}
