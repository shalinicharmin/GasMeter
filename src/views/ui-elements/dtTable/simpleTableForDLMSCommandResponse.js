import SimpleDataTable from "@src/views/ui-elements/dtTable/simpleTable"
import { useState } from "react"

import { DLMSCommandMapping } from "../../project/utility/module/hes/utils"

const SimpleTableForDLMSCommandResponse = (props) => {
  const [page, setpage] = useState(0)

  const tblData = DLMSCommandMapping(props.commandName, props.data)

  //   console.log('Command Response Tabular Data ...')
  //   console.log(props.data)
  //   console.log('Updated Data as per DLMS Standard ........')
  //   console.log(DLMSCommandMapping(props.commandName, props.data))
  //   console.log(props.commandName)

  const tblColumn = () => {
    const column = []
    const custom_width = ["manufacturer_name", "exec_datetime"]

    for (const i in tblData[0]) {
      const col_config = {}
      if (i !== "id" && i !== "SM_device_id") {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll("_", " ")
        col_config.serch = i
        col_config.selector = (row) => row[i]
        col_config.sortable = true
        if (props.commandName === "PROFILE_INSTANT" || props.commandName === "BILLING") {
          col_config.width = "200px"
        }
        if (custom_width.includes(i)) {
          col_config.width = "190px"
        }

        col_config.cell = (row) => {
          return (
            <div className="d-flex">
              <span
                className="d-block font-weight-bold"
                title={
                  row[i]
                    ? row[i]
                      ? row[i] !== ""
                        ? row[i].toString().length > 20
                          ? row[i]
                          : ""
                        : "-"
                      : "-"
                    : "-"
                }
              >
                {row[i] || row[i] === 0
                  ? (row[i] || row[i] === 0) && row[i] !== ""
                    ? row[i].toString().substring(0, 20)
                    : "-"
                  : "-"}
                {row[i] || row[i] === 0
                  ? (row[i] || row[i] === 0) && row[i] !== ""
                    ? row[i].toString().length > 20
                      ? "..."
                      : ""
                    : "-"
                  : "-"}
              </span>
            </div>
          )
        }
        column.push(col_config)
      }
    }
    column.unshift({
      name: "Sr",
      width: "90px",
      cell: (row, i) => {
        return <div className="d-flex  justify-content-center">{page * props.rowCount + 1 + i}</div>
      }
    })
    return column
  }

  return (
    <SimpleDataTable
      columns={tblColumn()}
      tblData={tblData}
      currentpage={page}
      ispagination
      selectedPage={setpage}
      height={props.height ? props.height : ""}
      rowCount={props.rowCount ? props.rowCount : 8}
      tableName={props.tableName}
      refresh={props.refresh && props.refresh}
      extras={props.extras}
      smHeading={props.smHeading}
    />
  )
}

export default SimpleTableForDLMSCommandResponse
