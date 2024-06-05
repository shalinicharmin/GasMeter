import ExcelExport from "export-xlsx"

import jsPDF from "jspdf"
import "jspdf-autotable"
import polarislogo from "@src/assets/images/logo/updated_logo.jpg"
// ** Converts table to CSV
function convertArrayOfObjectsToCSV(array, column, additional_columns) {
  // console.log('Table Data as array')
  // console.log(array)
  let result
  const column_name = []

  if (additional_columns) {
    for (const col of additional_columns) {
      column_name.push(col)
    }
  }

  if (column) {
    for (const i of column) {
      if (i.name !== "Sr" && i.name !== "Sr No.") {
        // Exclude the "Sr" column from column_name
        column_name.push(i.serch)
      }
    }
  }

  const columnDelimiter = ","
  const lineDelimiter = "\n"
  const keys = column ? column_name : Object.keys(array[0])

  // console.log(keys)

  result = ""
  result += keys.join(columnDelimiter)
  result += lineDelimiter

  // console.log(result)

  array.forEach((item) => {
    let ctr = 0
    keys.forEach((key) => {
      if (ctr > 0) {
        result += columnDelimiter
      }

      const final_string = item[key] ? item[key].toString().replace(/,/g, " ") : "--"
      result += final_string

      ctr++
    })
    result += lineDelimiter
  })

  // console.log(result)

  return result
}

// ** Downloads CSV
export function DownloadCSV(data, csv_name, column = false, additional_columns = false) {
  // console.log('Data for csv download .....')
  // console.log(data)

  if (!data.length) {
    return true
  }

  for (let i = 0; i < data.length; i++) {
    for (const key in data[i]) {
      if (
        data[i][key] === "" ||
        data[i][key] === null ||
        data[i][key] === undefined ||
        data[i][key] === "NaT" ||
        data[i][key] === "nan"
      ) {
        data[i][key] = "--"
      }
    }
  }

  // console.log('Updated Data for csv download ....')
  // console.log(data)

  try {
    let indx_to_remove
    for (const i of column) {
      if (i.name === 'Action') {
        indx_to_remove = column.indexOf(i)
      }
    }

    column.splice(indx_to_remove, 1)
  } catch (e) {
    console.log('');
  }

  const link = document.createElement("a")
  let csv = convertArrayOfObjectsToCSV(data, column, additional_columns)
  if (csv === null) return

  const filename = `${csv_name}.csv`

  if (!csv.match(/^data:text\/csv/i)) {
    csv = `data:text/csv;charset=utf-8,${csv}`
  }

  link.setAttribute("href", encodeURI(csv))
  link.setAttribute("download", filename)
  link.click()
}

// function to dowload data in excel
export const DownloadExcel = (tableName, columns, tableData) => {
  //table format to download data in excel
  const data_temp = [
    {
      table1: tableData
    }
  ]

  // table value to get data in excel;
  const column_name = []
  for (let i = 0; i < columns.length; i++) {
    const temp = {
      name: columns[i]["name"],
      key: columns[i]["serch"],
      width: 25
    }
    column_name.push(temp)
  }

  const data_temp_format = {
    // Table settings
    fileName: tableName,
    workSheets: [
      {
        sheetName: tableName.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, ""),
        startingRowNumber: 2,
        gapBetweenTwoTables: 2,
        tableSettings: {
          table1: {
            headerDefinition: column_name
          }
        }
      }
    ]
  }

  const excelExport = new ExcelExport()
  excelExport.downloadExcel(data_temp_format, data_temp)
}

// function to dowload data in pdf
export const DownloadPDF = (tableName, columns, tblData) => {
  // console.log(tblData)
  const unit = "pt"
  const size = "A4" // Use A1, A2, A3, or A4
  const orientation = columns.length < 6 ? "portrait" : "landscape" // portrait or landscape

  const marginLeft = 40
  const doc = new jsPDF(orientation, unit, size)

  doc.setFontSize(15)

  const title = tableName

  const groupSize = 13 // Number of columns per group
  const totalPages = Math.ceil(columns.length / groupSize)

  //Add the header
  const addHeader = () => {
    const logoWidth = 70 // Adjust the logo width as needed
    const logoHeight = 70 // Adjust the logo height as needed

    // Set logo position
    const logoX = 745
    const logoY = -5

    // Set company name position
    const companyNameX = 600 + logoWidth
    const companyNameY = 27

    // Add logo image to the header
    doc.addImage(polarislogo, "PNG", logoX, logoY, logoWidth, logoHeight)

    // Add company name to the header
    doc.setFontSize(12) // Adjust the font size of the company name
    // const companyName = 'Polaris Smart Metering Pvt. Ltd.'
    // const companyNameLines = doc.splitTextToSize(companyName, 150) // Adjust the width as needed
    // doc.text(companyNameX, companyNameY)
  }

  // Define the footer content
  const footerHeight = 30 // Adjust the footer height as needed
  const footerText =
    "Polaris Smart Metering Pvt. Ltd., E-418, Road No. 14, V.K.I. Area, Jaipur, Rajasthan-302013, India "

  // Add the footer to each page
  const addFooter = () => {
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 0; i < pageCount; i++) {
      doc.setPage(i)

      // Calculate the position of the footer
      const pageHeight = doc.internal.pageSize.height
      const footerY = pageHeight - footerHeight

      // Set the font and font size for the footer
      doc.setFont("Arial", "normal")
      doc.setFontSize(10)

      // Add the footer text and line
      doc.text(footerText, marginLeft, footerY + 15)
      doc.line(
        marginLeft,
        footerY,
        marginLeft + doc.internal.pageSize.width - marginLeft * 2,
        footerY
      )
    }
  }
  // let rowId = 1 // Initialize rowId counter

  for (let page = 0; page < totalPages; page++) {
    const startIndex = page * groupSize
    const endIndex = Math.min(startIndex + groupSize, columns.length)
    const columnGroup = columns.slice(startIndex, endIndex)

    const groupColumnNames = columnGroup.map((column) => column.name)
    // Remove the "Sr" key column from the groupColumnNames array
    const filteredGroupColumnNames = groupColumnNames.filter(
      (columnName) => columnName !== "Sr" && columnName !== "Sr No."
    )
    // Add "Id" as the first column
    const groupHeaders = [["Id", ...filteredGroupColumnNames]]
    // console.log(groupHeaders)

    const groupPdfData = tblData.map((elt, i) => {
      const rowData = [i + 1] // Increment rowId for each row
      for (const columnName of filteredGroupColumnNames) {
        let key = columnName.charAt(0).toLowerCase() + columnName.slice(1).replaceAll(" ", "_")
        if (!elt.hasOwnProperty(key)) {
          key = columnName.charAt(0).toUpperCase() + columnName.slice(1).replaceAll(" ", "_")
        }
        const value = elt[key] || elt[`sr_${i + 1}`]
        // console.log(key, ':', elt[key])
        rowData.push(value === undefined ? "--" : value)
      }
      // console.log('rowData', rowData)

      return rowData
    })

    // console.log('groupPdfData', groupPdfData)
    const content = {
      head: groupHeaders,
      body: groupPdfData,
      startY: 50
    }

    if (page > 0) {
      doc.addPage()
    }
    if (page === 0) {
      addHeader()
    }

    doc.setFontSize(15)
    doc.text(title, marginLeft, 40)
    doc.autoTable(content)
  }

  addFooter()

  doc.save(`${tableName}.pdf`)
}
export default { DownloadCSV, DownloadExcel, DownloadPDF }
