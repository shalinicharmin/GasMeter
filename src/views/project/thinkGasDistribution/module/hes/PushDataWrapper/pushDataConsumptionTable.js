import React, { useState } from "react"
import GasMeteringPaginatedTable from "../../../../../ui-elements/gasMeteringTable/gasMeteringPaginatedTable"
// import { Modal, ModalBody, ModalHeader } from 'reactstrap'
// import MeterProfileTabs from './meterProfileTabs'
import { caseInsensitiveSort } from "@src/views/utils.js"

const PushDataConsumptionTable = (props) => {
  //   const [centeredModal, setCenteredModal] = useState(false)

  // console.log('Response ....')
  // console.log(props.response)

  const data = [
    {
      Command_Name: "Block Load ",
      Command_Executor: "xyz",
      Command_Execution_Time: "09:05:23",
      Command_Status: "pending",
      Command_parameter: "-"
    },
    {
      Command_Name: "periodic Push",
      Command_Executor: "abc",
      Command_Execution_Time: "09:05:23",
      Command_Status: "pending",
      Command_parameter: "-"
    },
    {
      Command_Name: "periodic Push",
      Command_Executor: "abc",
      Command_Execution_Time: "09:05:23",
      Command_Status: "pending",
      Command_parameter: "-"
    },
    {
      Command_Name: "periodic Push",
      Command_Executor: "abc",
      Command_Execution_Time: "09:05:23",
      Command_Status: "pending",
      Command_parameter: "-"
    },
    {
      Command_Name: "Block Load ",
      Command_Executor: "xyz",
      Command_Execution_Time: "09:05:23",
      Command_Status: "pending",
      Command_parameter: "-"
    },
    {
      Command_Name: "Block Load ",
      Command_Executor: "xyz",
      Command_Execution_Time: "09:05:23",
      Command_Status: "pending",
      Command_parameter: "-"
    },
    {
      Command_Name: "Block Load ",
      Command_Executor: "xyz",
      Command_Execution_Time: "09:05:23",
      Command_Status: "pending",
      Command_parameter: "-"
    },
    {
      Command_Name: "Block Load ",
      Command_Executor: "xyz",
      Command_Execution_Time: "09:05:23",
      Command_Status: "pending",
      Command_parameter: "-"
    }
  ]
  const tblColumn = () => {
    const column = []
    const custom_width = ["blockload_datetime"]

    for (const i in props.response[0]) {
      const col_config = {}
      if (i !== "id") {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll("_", " ")
        col_config.serch = i
        col_config.sortable = true
        col_config.reorder = true
        // col_config.width = '180px'
        col_config.selector = (row) => row[i]
        col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)

        if (custom_width.includes(i)) {
          col_config.width = "190px"
        }

        col_config.cell = (row) => {
          return (
            <div className='d-flex'>
              <span className='d-block font-weight-bold cursor-pointer'>
                {row[i]}

                {/* title={row[i] ? (row[i] !== '' ? (row[i].toString().length > 10 ? row[i] : '') : '-') : '-'}>
                {row[i] && row[i] !== '' ? row[i].toString().substring(0, 10) : '-'}
                {row[i] && row[i] !== '' ? (row[i].toString().length > 10 ? '...' : '') : '-'} */}
              </span>
            </div>
          )
        }
        column.push(col_config)
      }
    }
    return column
  }
  return (
    <>
      <GasMeteringPaginatedTable
        columns={tblColumn()}
        tblData={props.response}
        rowCount={10}
        tableName={"Meter Profile"}
        // refresh={reloadData}
        currentPage={"1"}
        totalCount={"10"}
        // onNextPageClicked={onNextPageClicked}
      />

      {/* <Modal isOpen={centeredModal} toggle={() => setCenteredModal(!centeredModal)} className={`modal_size modal-dialog-centered`}>
        <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>Command History data</ModalHeader>
        <ModalBody>
          <MeterProfileTabs />
        </ModalBody>
      </Modal> */}
    </>
  )
}

export default PushDataConsumptionTable
