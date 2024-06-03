import { toast } from "react-toastify"
import dayjs from "./dayjs"
import { jwtDecode } from "jwt-decode"

import { getAuthUserId } from "./tokens"

export const loadScriptByURL = (id, url, callback) => {
  const isScriptExist = document.getElementById(id)

  if (!isScriptExist) {
    var script = document.createElement("script")
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
  if (mms_type == "image") {
    return "photoMms"
  } else if (mms_type == "video") {
    return "videoMms"
  } else if (mms_type == "audio") {
    return "audioMms"
  } else {
    return "text"
  }
}

export const dataURLtoFile = (dataurl, filename) => {
  let arr = dataurl.split(","),
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
//added this functionfor removing Object Refrence and prevents sharing old object refrence and its updating values
export const getFreshObject = (currentObject) => {
  if (currentObject) {
    let currentObjectString = JSON.stringify(currentObject)
    let newObject = jsonParse(currentObjectString)
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
    let diffInHours = dayjs.duration(toDate.diff(fromDate)).asHours()

    if (diffInHours < 24) {
      difference = parseInt(diffInHours) + "h ago"
    } else {
      difference = difference.split("a day").join("1d")
      difference = difference.split(" days").join("d")
      difference = difference.split(" day").join("d")
    }
  } else if (difference.search("a month ago") >= 0) {
    let diffMonth = dayjs.duration(toDate.diff(fromDate)).asMonths()

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
  let toDate = dayjs()

  let difference = toDate.diff(joining_date, "days")

  if (difference <= 30) {
    return true
  }
  return false
}

export const getOnlineStatus = (spModelObject) => {
  const vacationMode = spModelObject?.awayMode || spModelObject?.vacation_mode || 0
  let msglogtime = spModelObject?.msglogtime

  var MODEL_AVAIL_COLS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

  let objModelAvailablity = spModelObject?.modelAvailability
  let today = new Date()
  let dayOfWeek = today.getDay()
  let column_day = MODEL_AVAIL_COLS[dayOfWeek]
  let open_time_column = column_day + "_open_time"

  let response = {
    dot_color: "green",
    outline_color: "none",
    label_color: "green",
    label_text: "Available",
    activity_text: "Active " + timeDifferenceText(msglogtime)
  }

  if (objModelAvailablity !== undefined) {
    if (vacationMode != 1 && objModelAvailablity[open_time_column] == "00:00:01") {
      response = {
        dot_color: "green",
        outline_color: "none",
        label_color: "gray",
        label_text: "Limited",
        activity_text: "Active " + timeDifferenceText(msglogtime)
      }
    }
  }

  let getDiffMin = dayjs.duration(dayjs().diff(dayjs(msglogtime))).asMinutes()

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

  if (vacationMode == 1) {
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

export const debounce = (func, delay) => {
  let debounceTimer
  return function () {
    const context = this
    const args = arguments
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => func.apply(context, args), delay)
  }
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
export const getRandomInt = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * function is used to init video & audio call in angular from react
 * callType=VIDEO/AUDIO
 * */
export const initCall = (callType, customer_id, customer_name, modelId, modelUrl, callRequest) => {
  if (window !== undefined && typeof Storage !== "undefined") {
    var localDate = new Date()
    let currentTime = dayjs.utc(localDate).format()
    let data = {
      callType,
      customer_id,
      modelId,
      currentTime,
      customer_name,
      modelUrl,
      callRequest
    }
    localStorage.removeItem("lscalldata")

    localStorage.setItem("lscalldata", JSON.stringify(data))

    if (callRequest === "receive") {
      window.location.href = window.location.origin + appRoute("/model/messages")
    } else {
      window.location.href = window.location.origin + "/user/messages?modelId=" + modelId
    }
  }
}

export const formatAmountNumber = (num, fractionDigits = 2) => {
  // num = (123456.1234567890).toFixed(fractionDigits)
  if (num) {
    return (+num).toLocaleString(undefined, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    })
  }
  return num
}

export const shuffle = (array) => {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

export const loadSpImage = (
  url,
  cropType = "timthumb",
  height = null,
  width = null,
  return404ForBrokenSpImage = false
) => {
  if (isEmpty(url)) {
    return "/images/loader_img.png"
  }

  let params = {}
  let filePathInfo = pathInfo(url)

  if (filePathInfo.filenameOnly.split("_np_").length > 1) {
    //check for public image url
    return loadPublicSpImage(url, height, width)
  }

  if (return404ForBrokenSpImage == true) {
    let urlSplit = url.split("/pre?")
    if (urlSplit.length == 2) {
      url = url + "&web_page=1"
    }
  }
  if (cropType == "timthumb") {
    let timthumb = process.env.TIMTHUMB_URL + "?w=300&h=300&a=t&zc=1&src="
    return timthumb + url
  }
  if (cropType == "highQualityThumb") {
    let highQualityThumb = process.env.TIMTHUMB_URL + "?w=500&h=500&a=c&zc=1&src="
    return highQualityThumb + url
  }
  if (cropType == "hightCrop") {
    let hightCrop = process.env.TIMTHUMB_URL + "?h=500&a=c&zc=3&src="
    return hightCrop + url
  }
  if (cropType == "potraitThumb") {
    let potraitThumb = process.env.TIMTHUMB_URL + "?w=400&h=400&a=c&zc=1&src="
    return potraitThumb + url
  }
  if (cropType == "custom") {
    params.src = url
    params.a = "c"
    params.zc = "1"

    if (height !== null) {
      params.h = height
    }
    if (width !== null) {
      params.w = width
    }
    params = decodeURIComponent(new URLSearchParams(params).toString())

    let potraitThumb = process.env.TIMTHUMB_URL + "?" + params
    return potraitThumb
  }

  return url
}

export const loadPublicSpImage = (url, height = null, width = null) => {
  if (height !== null && width !== null && url.split("/th_images/").length <= 1) {
    let filePathInfo = pathInfo(url)
    // let validImageFileExtensionsForWebP = ['JPEG', 'JPG', 'PNG', 'BMP'];
    url =
      filePathInfo.dirname +
      filePathInfo.filenameOnly +
      "-" +
      height +
      "x" +
      width +
      "." +
      filePathInfo.extension
  }

  return url
}
export const webp_support = () => {
  if (typeof document === "undefined") {
    return false
  }
  var elem = document.createElement("canvas")
  if (elem.getContext && elem.getContext("2d")) {
    // was able or not to get WebP representation
    return elem.toDataURL("image/webp").indexOf("data:image/webp") == 0
  } else {
    // very old browser like IE 8, canvas not supported
    return false
  }
}

export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const jsonParse = function (str) {
  try {
    return JSON.parse(str)
  } catch (e) {
    return {}
  }
}

export const convertDate = (data) => {
  if (data && data.length > 0) {
    let temp = data[0].sentDate
    data.map((obj, i) => {
      if (i > 0) {
        data[i - 1]["displayDate"] = temp !== obj.sentDate ? true : false
      } else {
        data[i]["displayDate"] = temp !== obj.sentDate ? true : false
      }
      temp = obj.sentDate
      obj.addAnimation = true
    })
  }
  return data
}

export const formatUnlockDate = (unlockUtc, sentUtc) => {
  let formatdUnlockDate = ""
  let unlockTime = " @ " + dayjs(unlockUtc).format("h:mm A")
  let unlockYear = dayjs(unlockUtc).format("YYYY")
  let sentYear = dayjs(sentUtc).format("YYYY")
  let unlockYearAndDate = dayjs(unlockUtc).format("D-M")
  let sentYearAndDate = dayjs(sentUtc).format("D-M")

  if (sentYear !== unlockYear) {
    formatdUnlockDate += " on " + dayjs(unlockUtc).format("M/D/YY")
  } else if (sentYearAndDate !== unlockYearAndDate) {
    formatdUnlockDate += " on " + dayjs(unlockUtc).format("M/D")
  }
  formatdUnlockDate += unlockTime

  return formatdUnlockDate
}

export const getUserShortName = (name) => {
  if (name) {
    let temp = name.split(" ")
    if (temp && temp.length === 1) {
      return temp[0][0]
    } else if (temp && temp.length > 1) {
      return temp[0][0] + temp[1][0]
    }
  }
  return ""
}

export const formatDuration = (duration, WithHours = false) => {
  let formatedDuration = "00:00"
  if (duration) {
    if (WithHours === true) {
      formatedDuration = dayjs("2015-01-01")
        .startOf("day")
        // .seconds(duration)
        .add(duration, "seconds")
        .format("HH:mm:ss")
      return formatedDuration
    }

    let DurationHour = parseInt(
      dayjs("2015-01-01")
        .startOf("day")
        // .seconds(duration)
        .add(duration, "seconds")
        .format("HH")
    )

    if (DurationHour > 0) {
      formatedDuration = dayjs("2015-01-01")
        .startOf("day")
        // .seconds(duration)
        .add(duration, "seconds")
        .format("HH:mm:ss")
    } else {
      formatedDuration = dayjs("2015-01-01")
        .startOf("day")
        // .seconds(duration)
        .add(duration, "seconds")
        .format("mm:ss")
    }
  }
  return formatedDuration
}

export const convertLocalTime = (dateTime) => {
  let localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  if (dateTime) {
    let utcTime = dayjs.tz(dateTime, "America/Los_Angeles")
    return dayjs(utcTime).tz(localTimeZone)
  }
  return dateTime
}

export const getDuration = (sec) => {
  sec = Number(sec)
  var h = Math.floor(sec / 3600)
  var m = Math.floor((sec % 3600) / 60)
  var s = Math.floor((sec % 3600) % 60)

  var hDisplay = h > 0 ? h + "h " : ""
  var mDisplay = m > 0 ? m + "m " : ""
  var sDisplay = s > 0 ? s + "s" : ""
  return hDisplay + mDisplay + sDisplay
}

export const lastSeenTimeFormat = (value, displayDate = false) => {
  if (value) {
    let a, b, c, d1, d2
    d1 = new Date(dayjs().locale("en").format("YYYY-MM-DD"))
    d2 = dayjs(value).format("YYYY-MM-DD")
    a = dayjs(d1)
    b = dayjs(d2)
    c = a.diff(b, "days")
    if (c === 0 && !displayDate) {
      return dayjs(value).format("hh:mm a")
    } else if (c === 1) {
      return "Yesterday"
    } else {
      return dayjs(value).format("MM/DD/YY")
    }
  }
  return ""
}
export const formatNumber = (number) => {
  let formatedNumber =
    "+" +
    number.substring(0, 1) +
    "(" +
    number.substring(1, 4) +
    ") " +
    number.substring(4, 7) +
    "-" +
    number.substring(7, 12)

  return formatedNumber
}

export const addSuffixToNumber = (n) => {
  if (n >= 11 && n <= 13) {
    return formatAmountNumber(n, 0) + " th"
  }
  switch (n % 10) {
    case 1:
      return formatAmountNumber(n, 0) + " st"
    case 2:
      return formatAmountNumber(n, 0) + " nd"
    case 3:
      return formatAmountNumber(n, 0) + " rd"
    default:
      return formatAmountNumber(n, 0) + " th"
  }
}
export const suffleOnlineModels = (onlineModels) => {
  // let onlineModels = this.state.onlineModels.items;

  let modelsAvailableBeforeFiveMins = []
  let modelsAvailableBeforeOneHour = []
  let modelsAvailableAfterOneHour = []

  for (let i = 0; i < onlineModels.length; i++) {
    let currentObj = onlineModels[i]
    let getDiffMin = dayjs.duration(dayjs().diff(dayjs(currentObj.msglogtime))).asMinutes()
    if (getDiffMin < 5) {
      modelsAvailableBeforeFiveMins.push(currentObj)
    } else if (getDiffMin <= 60) {
      modelsAvailableBeforeOneHour.push(currentObj)
    } else {
      modelsAvailableAfterOneHour.push(currentObj)
    }
  }
  modelsAvailableBeforeFiveMins = shuffle(modelsAvailableBeforeFiveMins)
  modelsAvailableBeforeOneHour = shuffle(modelsAvailableBeforeOneHour)

  let onlineModelList = modelsAvailableBeforeFiveMins
    .concat(modelsAvailableBeforeOneHour)
    .concat(modelsAvailableAfterOneHour)

  return onlineModelList
}
export const suffleNeweModels = (newModels) => {
  // let newModels = this.state.newModels.items;

  let newModelListByMonth = []
  let newModelList = []

  for (let i = 0; i < newModels.length; i++) {
    let currentObj = newModels[i]
    let getDiffMonth = dayjs.duration(dayjs().diff(dayjs(currentObj.joining_date))).asMonths()
    getDiffMonth = Math.floor(getDiffMonth)

    if (newModelListByMonth[getDiffMonth] === undefined) {
      newModelListByMonth[getDiffMonth] = []
    }
    newModelListByMonth[getDiffMonth].push(currentObj)
  }

  newModelListByMonth.forEach((value, key) => {
    newModelList = newModelList.concat(shuffle(value))
  })

  return newModelList
}

//function to get json of query parameter from react-router's asPath
export const extractQueryParams = (path) => {
  // split at first `?`
  const searchParams = new URLSearchParams(path.split(/\?/)[1])

  const query = {}
  for (const [key, value] of searchParams) {
    query[key] = value
  }

  return query
}
export const isEmpty = (val) => {
  if (val === undefined || val === null || val === "" || val == 0 || val?.length === 0) {
    return true
  }
  if (typeof val === "object") {
    return Object.keys(val).length === 0 && val.constructor === Object
  }
  return false
}
export const formattedJoinDate = (jdate) => {
  var currentdate = new Date()
  var joiningdate = new Date(jdate)
  var a = dayjs(currentdate)
  var b = dayjs(joiningdate)
  var diffDays = a.diff(b, "days")

  if (diffDays > 1) {
    return "Joined " + diffDays + " days ago"
  } else if (diffDays == 1) {
    return "Joined yesterday"
  } else {
    return "Joined today"
  }
}

export const getFeesData = (type) => {
  let minMaxData = {}
  switch (type) {
    case "text":
      minMaxData.key = "messagecredit"
      minMaxData.incrementValue = 0.25
      minMaxData.maxValue = 5.0
      minMaxData.minValue = 1.0

      break
    case "outgoing_text":
      minMaxData.key = "outgoing_messagecredit"
      minMaxData.incrementValue = 0
      minMaxData.maxValue = 0
      minMaxData.minValue = 0
      break
    case "file":
    case "photo":
      minMaxData.key = "photocredit"
      minMaxData.incrementValue = 0.25
      minMaxData.maxValue = 10.0
      minMaxData.minValue = 1.0
      break
    case "audio":
      minMaxData.key = "audiocredit"
      minMaxData.incrementValue = 0.25
      minMaxData.maxValue = 10.0
      minMaxData.minValue = 1.0
      break
    case "video":
      minMaxData.key = "videocredit"
      minMaxData.incrementValue = 0.25
      minMaxData.maxValue = 20.0
      minMaxData.minValue = 1.0
      break
    case "outgoing_photo":
      minMaxData.key = "outgoing_photocredit"
      minMaxData.incrementValue = 0.25
      minMaxData.maxValue = 10.0
      minMaxData.minValue = 1.0
      break
    case "outgoing_audio":
      minMaxData.key = "outgoing_audiocredit"
      minMaxData.incrementValue = 0.25
      minMaxData.maxValue = 10.0
      minMaxData.minValue = 1.0
      break
    case "outgoing_video":
      minMaxData.key = "outgoing_videocredit"
      minMaxData.incrementValue = 0.25
      minMaxData.maxValue = 20.0
      minMaxData.minValue = 1.0
      break
    case "callPrice":
      minMaxData.key = "call_charges"
      minMaxData.incrementValue = 0.25
      minMaxData.maxValue = process.env.APPLICATION_NAME === "MYNX" ? 50.0 : 10.0
      // minMaxData.maxValue = 10.0;
      minMaxData.minValue = 1.0
      break
    case "callTime":
      minMaxData.key = "call_mininum_time"
      minMaxData.incrementValue = 1
      minMaxData.maxValue = 10
      minMaxData.minValue = 1
      break
    case "videoPrice":
      minMaxData.key = "video_call_charges"
      minMaxData.incrementValue = 0.25
      minMaxData.maxValue = process.env.APPLICATION_NAME === "MYNX" ? 100.0 : 30.0
      // minMaxData.maxValue = 30.0;
      minMaxData.minValue = 1.0
      break
    case "videoTime":
      minMaxData.key = "video_call_minimum_time"
      minMaxData.incrementValue = 1
      minMaxData.maxValue = 10
      minMaxData.minValue = 1
      break

    default:
      break
  }

  return minMaxData
}

export const pathInfo = (filePath) => {
  let filePathSeparaterArrray = filePath.split("/")
  let basename = filePathSeparaterArrray[filePathSeparaterArrray.length - 1]

  filePathSeparaterArrray.pop() //remove name from path

  let dirname = filePathSeparaterArrray.join("/") + "/"
  let fileNameSeparaterArrray = basename.split(".")
  let extension = fileNameSeparaterArrray[fileNameSeparaterArrray.length - 1]

  fileNameSeparaterArrray.pop() //remove extension from basename
  let filenameOnly = fileNameSeparaterArrray.join(".")

  return {
    filePath,
    dirname,
    basename,
    filenameOnly,
    extension
  }
}
export const capitalizeFirstLetter = (string) => {
  if (isEmpty(string)) {
    return string
  }
  return string.charAt(0).toUpperCase() + string.slice(1)
}
export const formatMobileNumber = (mobileNumber) => {
  mobileNumber = mobileNumber.replace(/[^0-9]/g, "")
  if (mobileNumber.charAt(0) == 0) {
    mobileNumber = mobileNumber.slice(1)
  }
  return mobileNumber
}

export const checkGenderPrefSelected = () => {
  const item = getCookie("selectedgender")
  if (isEmpty(item)) {
    return false
  }
  const itemArr = item.split(",")
  return itemArr.length > 1 ? true : false
}

export const isSafari = () => {
  let isSafari =
    navigator.vendor.match(/apple/i) &&
    !navigator.userAgent.match(/crios/i) &&
    !navigator.userAgent.match(/fxios/i) &&
    !navigator.userAgent.match(/Opera|OPT\//)
  return isSafari
}

export const getDisplayString = (value, modelArr, hashTagArr) => {
  let appUrl = process.env.APP_URL
  let appUrlSplit = appUrl?.split(".")
  let domain = appUrlSplit[appUrlSplit.length - 2] + "." + appUrlSplit[appUrlSplit.length - 1]
  try {
    if (modelArr && modelArr.length > 0 && !isEmpty(value)) {
      modelArr.map((obj) => {
        value = value
          .split(`##${obj.id}##`)
          .join(
            `<a contenteditable="false" target="${
              !isEmpty(obj.base_path) && obj.base_path.includes(domain) === false
                ? "_blank"
                : "_self"
            }" href="${obj.base_path ? obj.base_path : "/"}${obj.modelurl}">${obj.name}</a>`
          )
      })
    }
    if (hashTagArr && hashTagArr.length > 0 && !isEmpty(value)) {
      hashTagArr.map((obj) => {
        if (obj.hashtag.includes("#")) {
          value = value
            .split(`✜${obj.hashtag_cs || obj.hashtag}✜#`)
            .join(
              `${
                process.env.APPLICATION_NAME == "SLYD"
                  ? `#${obj.hashtag_cs || obj.hashtag}`
                  : `<a contenteditable="false" target="'_blank" href="/explore/${
                      obj.hashtag_cs || obj.hashtag
                    }">#${obj.hashtag_cs || obj.hashtag}</a>`
              }`
            )
        } else {
          value = value
            .split(`✜#${obj.hashtag_cs || obj.hashtag}✜#`)
            .join(
              `${
                process.env.APPLICATION_NAME == "SLYD"
                  ? `#${obj.hashtag_cs || obj.hashtag}`
                  : `<a contenteditable="false" target="'_blank" href="/explore/${
                      obj.hashtag_cs || obj.hashtag
                    }">#${obj.hashtag_cs || obj.hashtag}</a>`
              }`
            )
        }
      })
    }
  } catch (error) {
    console.log(error, "error...")
  }
  return value
}

export const getSessionToken = () => {
  if (typeof window !== "undefined") {
    let session = sessionStorage.getItem("profile")
    return jsonParse(session)
  }
}

export const getCookie = (cname) => {
  var name = cname + "="
  var decodedCookie = decodeURIComponent(document.cookie)
  var ca = decodedCookie?.split(";")
  for (var i = 0; i < ca?.length; i++) {
    var c = ca[i]
    while (c.charAt(0) == " ") {
      c = c.substring(1)
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ""
}
export const getSuffix = (i) => {
  let j = i % 10,
    k = i % 100
  if (j == 1 && k != 11) {
    return i + "st"
  }
  if (j == 2 && k != 12) {
    return i + "nd"
  }
  if (j == 3 && k != 13) {
    return i + "rd"
  }
  return i + "th"
}

export const isQAEnv = () => {
  if (typeof window === "undefined") {
    return false
  }
  let host = window.location.host
  let qaHosts = ["tacorosa.club", "qa-", "localhost"]

  for (let i = 0; i < qaHosts.length; i++) {
    const qaHost = qaHosts[i]
    if (host.includes(qaHost)) {
      return true
    }
  }

  return false
}

export const getDateTime = (formate) => {
  let date = new Date()
  let hours = date.getHours()
  let minutes = date.getMinutes()
  let seconds = date.getSeconds()
  let month = date.getMonth() + 1
  let todayDate = date.getDate()
  hours = hours < 10 ? "0" + hours : hours
  minutes = minutes < 10 ? "0" + minutes : minutes
  seconds = seconds < 10 ? "0" + seconds : seconds
  month = month < 10 ? "0" + month : month
  todayDate = todayDate < 10 ? "0" + todayDate : todayDate
  if (formate == "date") {
    return date.getFullYear() + "-" + month + "-" + todayDate
  } else if (formate == "time") {
    hours = date.getHours()
    let ampm = hours >= 12 ? "PM" : "AM"
    hours = hours % 12
    hours = hours ? hours : 12
    hours = hours < 10 ? "0" + hours : hours
    return hours + ":" + minutes + ":" + seconds + " " + ampm
  } else {
    return (
      date.getFullYear() +
      "-" +
      month +
      "-" +
      todayDate +
      " " +
      hours +
      ":" +
      minutes +
      ":" +
      seconds
    )
  }
}

export const getUtcDateTime = (formate) => {
  let date = new Date()
  let now_utc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  )
  return new Date(now_utc)
}

export const isTrendingModel = (modelData) => {
  return modelData.is_trending == 1
}

export const ordinal_suffix_of = (i) => {
  let j = i % 10,
    k = i % 100
  if (j == 1 && k != 11) {
    return i + "st"
  }
  if (j == 2 && k != 12) {
    return i + "nd"
  }
  if (j == 3 && k != 13) {
    return i + "rd"
  }
  return i + "th"
}

export const appRoute = (value) => {
  if (process.env.NODE_ENV !== "production") {
    return value
  }

  if (process.env.APPLICATION_NAME === "SLYD") {
    return value.replace("/model/", "/creator/")
  }
  return value
}

export const getKeyByValue = (object, value) => {
  // return Object.keys(object).find(key => object[key] === value);
  return Object.keys(object).find((key) => value.includes(object[key]))
}

export const getMessageMediaPrice = (uploadType, modelDetails, msg) => {
  let messageMediaCredit = 0
  switch (uploadType) {
    case "image":
      messageMediaCredit = +modelDetails?.photocredit
      break
    case "audio":
      messageMediaCredit = +modelDetails?.audiocredit
      break
    case "video":
      messageMediaCredit = +modelDetails?.videocredit
      break
  }
  if (msg.trim().length != 0) {
    messageMediaCredit += +modelDetails?.messagecredit
  }
  return messageMediaCredit
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
