import dayjs from "./dayjs"
import { jwtDecode } from "jwt-decode"

import { getAuthUserId } from "./tokens"
import { Award, Circle } from "react-feather"

export const loadScriptByURL = (id, url, callback) => {
  const isScriptExist = document.getElementById(id)

  if (!isScriptExist) {
    const script = document.createElement("script")
    script.type = "text/javascript"
    script.src = url
    script.id = id
    script.onload = function () {
      if (callback) callback()
    }
    document.body.appendChild(script)
  }

  if (isScriptExist && callback) callback()
}

export const getMediaType = (mms_type) => {
  if (mms_type === "image") {
    return "photoMms"
  } else if (mms_type === "video") {
    return "videoMms"
  } else if (mms_type === "audio") {
    return "audioMms"
  } else {
    return "text"
  }
}

export const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

export const getMonth = (month) => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]
  return monthNames[month]
}

export const jsonParse = function (str) {
  try {
    return JSON.parse(str)
  } catch (e) {
    return {}
  }
}

//added this functionfor removing Object Refrence and prevents sharing old object refrence and its updating values
export const getFreshObject = (currentObject) => {
  if (currentObject) {
    const currentObjectString = JSON.stringify(currentObject)
    const newObject = jsonParse(currentObjectString)
    return newObject
  }
  return currentObject
}

export const timeDifferenceText = (fromDate, toDate = null, returnDiffInDays = null) => {
  fromDate = dayjs(fromDate)
  if (toDate !== null) {
    toDate = dayjs(toDate)
  } else {
    toDate = dayjs()
  }
  let difference = fromDate.from(toDate)

  if (difference.search(" second") >= 0 || difference.search(" second") >= 0) {
    dayjs.updateLocale("en", {
      relativeTime: {
        future: "in %s",
        past: "%s ago",
        s: "%ds",
        ss: "%d seconds",
        m: "a minute",
        mm: "%d minutes",
        h: "an hour",
        hh: "%d hours",
        d: "a day",
        dd: "%d days",
        w: "a week",
        ww: "%d weeks",
        M: "a month",
        MM: "%d months",
        y: "a year",
        yy: "%d years"
      }
    })
  } else if (difference.search(" minute") >= 0 || difference.search(" minutes") >= 0) {
    difference = difference.split(" minutes").join("m")
    difference = difference.split("a minute").join("1m")
    difference = difference.split(" minute").join("m")
  } else if (difference.search(" hour") >= 0 || difference.search(" hours") >= 0) {
    if (difference.search("an hour") >= 0) {
      difference = difference.split("an hour").join("1h")
    } else {
      difference = difference.split(" hours").join("h")
      difference = difference.split(" hour").join("h")
    }
  } else if (difference.search(" day") >= 0 || difference.search(" days") >= 0) {
    const diffInHours = dayjs.duration(toDate.diff(fromDate)).asHours()

    if (diffInHours < 24) {
      difference = parseInt(diffInHours) + "h ago"
    } else {
      difference = difference.split("a day").join("1d")
      difference = difference.split(" days").join("d")
      difference = difference.split(" day").join("d")
    }
  } else if (difference.search("a month ago") >= 0) {
    const diffMonth = dayjs.duration(toDate.diff(fromDate)).asMonths()

    if (diffMonth < 1) {
      difference = fromDate.diff(toDate, "days")
      difference = Math.abs(difference) + "d ago"
    }
  }

  if (returnDiffInDays === true) {
    difference = fromDate.diff(toDate, "days")
    difference = Math.abs(difference) + "d"
  }
  return difference
}

export const isNewModel = (SpModelObject) => {
  let joining_date = SpModelObject?.joining_date
  joining_date = dayjs(joining_date)
  const toDate = dayjs()

  const difference = toDate.diff(joining_date, "days")

  if (difference <= 30) {
    return true
  }
  return false
}

export const getOnlineStatus = (spModelObject) => {
  const vacationMode = spModelObject?.awayMode || spModelObject?.vacation_mode || 0
  const msglogtime = spModelObject?.msglogtime

  const MODEL_AVAIL_COLS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

  const objModelAvailablity = spModelObject?.modelAvailability
  const today = new Date()
  const dayOfWeek = today.getDay()
  const column_day = MODEL_AVAIL_COLS[dayOfWeek]
  const open_time_column = column_day + "_open_time"

  let response = {
    dot_color: "green",
    outline_color: "none",
    label_color: "green",
    label_text: "Available",
    activity_text: "Active " + timeDifferenceText(msglogtime)
  }

  if (objModelAvailablity !== undefined) {
    if (vacationMode !== 1 && objModelAvailablity[open_time_column] === "00:00:01") {
      response = {
        dot_color: "green",
        outline_color: "none",
        label_color: "gray",
        label_text: "Limited",
        activity_text: "Active " + timeDifferenceText(msglogtime)
      }
    }
  }

  const getDiffMin = dayjs.duration(dayjs().diff(dayjs(msglogtime))).asMinutes()

  if (getDiffMin < 5) {
    response = {
      dot_color: "green",
      outline_color: "green",
      label_color: "green",
      label_text: "Online",
      activity_text: "Active now"
    }
  } else if (getDiffMin < 60) {
    response.outline_color = "green"
  }

  if (vacationMode === 1) {
    response = {
      dot_color: "red",
      outline_color: "none",
      label_color: "red",
      label_text: "Unavailable",
      activity_text: "Active " + timeDifferenceText(msglogtime)
    }
  }
  return response
}

export const isEmpty = (val) => {
  if (val === undefined || val === null || val === "" || val === 0 || val?.length === 0) {
    return true
  }
  if (typeof val === "object") {
    return Object.keys(val).length === 0 && val.constructor === Object
  }
  return false
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

export const isAccessAllowed = (vertical, project, module) => {
  const access = jwtDecode(localStorage.getItem("accessToken")).userData.access
  //   console.log('Access .....')
  //   console.log(access)
  //   console.log(vertical)
  //   console.log(project)
  //   console.log(module)

  for (let i = 0; i < access.length; i++) {
    if (access[i].title.toLowerCase() === vertical) {
      for (let j = 0; j < access[i].children.length; j++) {
        if (access[i].children[j].id.toLowerCase() === project) {
          for (let k = 0; k < access[i].children[j].children.length; k++) {
            if (access[i].children[j].children[k].id.toLowerCase() === module) {
              return true
            }
          }
        }
      }
    }
  }
  return false
}

export const isUserLoggedIn = () => {
  return localStorage.getItem("accessToken")

  // return localStorage.getItem('userData') && localStorage.getItem(useJwt.jwtConfig.storageTokenKeyName)
}

const iconMapping = {
  Award: <Award size={18} />,
  Circle: <Circle size={15} />,
  // Add other icons as needed
  // Default icon
  default: ""
}
export const convertData = (data, keyPrefix = "") => {
  return data?.map((item, index) => {
    const key = `${keyPrefix}${index + 1}`
    const newItem = {
      key: item.title,
      icon: iconMapping[item.icon] || iconMapping.default, // Assuming a static icon for simplicity
      label: item.title,
      navLink: item.navLink
    }

    if (item.children) {
      newItem.children = convertData(item.children, `${key}`)
    }

    return newItem
  })
}
