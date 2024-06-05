import jwt_decode from "jwt-decode"
import moment from "moment"

export const isAccessAllowed = (vertical, project, module) => {
  const access = jwt_decode(localStorage.getItem("accessToken")).userData.access
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

export const caseInsensitiveSort = (rowA, rowB, column) => {
  // console.log("rowA", rowA, "rowB", rowB, "column", column)

  // console.log(rowA[column], rowB[column])
  // console.log(typeof rowA[column], typeof rowB[column])

  let a = "--"
  if (rowA[column] === null || rowA[column] === "" || rowA[column] === undefined) {
    a = "--"
  } else {
    if (typeof rowA[column] === "number") {
      a = rowA[column]
    } else {
      a = rowA[column]
        .toString()
        .toLowerCase()
        .replace(/^\s+|\s+$/gm, "")
    }
  }

  let b = "--"
  if (rowB[column] === null || rowB[column] === "" || rowB[column] === undefined) {
    b = "--"
  } else {
    if (typeof rowB[column] === "number") {
      b = rowB[column]
    } else {
      b = rowB[column]
        .toString()
        .toLowerCase()
        .replace(/^\s+|\s+$/gm, "")
    }
  }

  if (a > b) {
    return 1
  }

  if (b > a) {
    return -1
  }

  return 0
}

export function formatDateTime(dateTimeStr, type) {
  const dateObj = new Date(dateTimeStr)
  if (type === "DATE") {
    return moment(dateObj).format("YYYY-MM-DD")
  } else if (type === "TIME") {
    return moment(dateObj).format("hh:mm:ss A")
  }
  return moment(dateObj).format("DD-MM-YYYY hh:mm:ss A")
}

export function csvTxtToJSON(txt) {
  txt = txt.trim()
  const raw = txt.split("\n")
  const keys = raw
    .shift()
    .split(",")
    .map((i) => i.trim())

  const rows = raw.map((rawRow) => {
    const rowValues = rawRow.split(",")
    const row = {}
    keys.map((key, index) => {
      row[key] = rowValues[index].trim()
    })
    return row
  })
  return rows
}
