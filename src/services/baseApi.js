import axios from "axios"

import { jwtDecode } from "jwt-decode"
import { toast } from "react-toastify"
import { isEmpty } from "../utils/commonFunction"
import { removeTokenData } from "../utils/commonFunction"
import { getAuthUserId, getAuthtoken } from "../utils/tokens"

const webp_support = () => {
  if (typeof document === "undefined") {
    return false
  }
  try {
    var elem = document.createElement("canvas")
    if (!!(!isEmpty(elem) && elem.getContext && elem.getContext("2d"))) {
      // was able or not to get WebP representation
      return elem.toDataURL("image/webp").indexOf("data:image/webp") == 0
    } else {
      // very old browser like IE 8, canvas not supported
      return false
    }
  } catch (error) {
    return false
  }
}

// Function to prepare headers
export const getPreparedHeaders = () => {
  const urlParts = typeof window !== "undefined" ? window.location.href.split("/").slice(4) : []
  const vertical = urlParts[0] || ""
  const project = urlParts[1] || ""
  const module_ = urlParts[2] || ""
  const token = localStorage?.getItem("token") || ""
  let username = ""
  let uniqueId = ""

  try {
    if (token) {
      const userDetails = jwtDecode(token)
      username = userDetails?.username
    }
    uniqueId = localStorage?.getItem("uniqueId") || ""
  } catch (error) {
    toast("Failed to decode token or retrieve user details:", {
      hideProgressBar: true,
      type: "error"
    })
  }

  return {
    vertical,
    project,
    module: module_,
    token,
    username,
    uniqueId
  }
}

export const prepareHeaders = (headers) => {
  console.log(headers)
  const { vertical, project, module, token, username, uniqueId } = getPreparedHeaders()

  if (module) headers.set("module", module)
  if (vertical) headers.set("vertical", vertical)
  if (project) headers.set("project", project)
  if (username) headers.set("username", username)
  if (token) headers.set("authorization", `Bearer ${token}`)
  if (uniqueId) headers.set("Unique_id", uniqueId)
  console.log(headers)
  return headers
}

// Axios instance configuration
let rawInstanceConfig = {
  baseURL: process.env.REACT_APP_BASE_URL,
  timeout: 60000,
  withCredentials: true,
  headers: {
    // Add any default headers here if needed
  }
}

export const rawInstance = axios.create(rawInstanceConfig)

// Adding request interceptor to set the headers
rawInstance.interceptors.request.use(
  (config) => {
    console.log(config)
    const preparedHeaders = new Headers()
    prepareHeaders(preparedHeaders)
    preparedHeaders.forEach((value, key) => {
      config.headers[key] = value
    })
    console.log(config)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

let tokenInstanceConfig = {
  baseURL: process.env.REACT_APP_BASE_URL,
  timeout: 60000,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
    "Content-Type": "XMapplication/jsonLHttpRequest",
    WebpSupport: webp_support() ? "yes" : "no"
    // 'authtoken': getAuthtoken(),
    // 'authuserid': getAuthUserId()
  }
}

export const tokenInstance = axios.create(tokenInstanceConfig)

tokenInstance.interceptors.request.use((tokenInstanceConfig) => {
  tokenInstanceConfig.headers.authtoken = getAuthtoken()
  let userId = getAuthUserId()
  if (userId) {
    tokenInstanceConfig.headers.authuserid = userId
  }
  // if (!urlEndPoint.includes(tokenInstanceConfig?.url)) {
  //   delete tokenInstanceConfig.headers["AuthorizationToken"]
  // }
  return tokenInstanceConfig
})

tokenInstance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error

    if (error.response?.status === 401) {
      removeTokenData()

      if (!window.location.pathname.includes("auth/email-verification")) {
        window.location.href = window.location.origin
      }
    }
    return Promise.reject(error)
  }
)
