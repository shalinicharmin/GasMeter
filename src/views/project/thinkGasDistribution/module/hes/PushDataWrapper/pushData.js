// import React from 'react'
import "@styles/react/libs/flatpickr/flatpickr.scss"
import { useState, useEffect } from "react"
import useJwt from "@src/auth/jwt/useJwt"

import { useLocation, useHistory } from "react-router-dom"

import GasMeteringPaginatedTable from "../../../../../ui-elements/gasMeteringTable/gasMeteringPaginatedTable"

import { CardBody, Card, Modal, ModalHeader, ModalBody } from "reactstrap"

import authLogout from "@src/auth/jwt/logoutlogic"

import { useDispatch, useSelector } from "react-redux"
import CardInfo from "@src/views/ui-elements/cards/actions/cardInfo"
import { caseInsensitiveSort } from "@src/views/utils.js"

import Loader from "@src/views/project/misc/loader"

import { Eye, X } from "react-feather"

import PushDataConsumptionTable from "./pushDataConsumptionTable"
import CommonFilter from "../commonFilter"
import moment from "moment"

// import { caseInsensitiveSort } from '@src/views/utils.js'

const PushData = () => {
  const pageSize = 10

  const dispatch = useDispatch()
  const history = useHistory()

  const [fetchingData, setFetchingData] = useState(true)
  const [rawResponse, setRawResponse] = useState([])
  const [response, setResponse] = useState([])
  const [totalCount, setTotalCount] = useState(120)
  const [currentPage, setCurrentPage] = useState(1)

  const [hasError, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [retry, setRetry] = useState(false)
  const [loader, setLoader] = useState(false)

  const [showReportDownloadModal, setShowReportDownloadModal] = useState(false)

  const [centeredModal, setCenteredModal] = useState(false)

  const [rowSelected, setRowSelected] = useState(undefined)

  const [pageRefresh, setPageRefresh] = useState(false)

  // Set default Start date to the current date and time
  const defaultStartDate = moment().startOf("month").format("YYYY-MM-DD 00:00:00")

  // Set default end date to the current date and time
  const defaultEndDate = moment().format("YYYY-MM-DD HH:mm:ss")

  const [filterParams, setFilterParams] = useState({
    start_date: defaultStartDate,
    end_date: defaultEndDate
  })
  const [selected_project, set_selected_project] = useState(undefined)

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const currentSelectedModuleStatus = useSelector(
    (state) => state.CurrentSelectedModuleStatusReducer.responseData
  )

  if (currentSelectedModuleStatus.prev_project) {
    if (
      selected_project !== currentSelectedModuleStatus.project &&
      currentSelectedModuleStatus.prev_project !== currentSelectedModuleStatus.project
    ) {
      set_selected_project(currentSelectedModuleStatus.project)

      setError(false)
      setCurrentPage(1)
      setFetchingData(true)
    }
  }

  const fetchData = async (params) => {
    return await useJwt
      .getGasMeterPeriodicPushData(params)
      .then((res) => {
        const status = res.status
        return [status, res]
      })
      .catch((err) => {
        if (err.response) {
          const status = err.response.status
          return [status, err]
        } else {
          return [0, err]
        }
      })
  }

  const location = useLocation()
  const projectName = location.pathname.split("/")[2]

  useEffect(async () => {
    if (fetchingData || retry) {
      setLoader(true)

      let params = undefined

      params = {
        project: projectName === "ag&p-pratham" ? "agp-pratham" : projectName,
        start_date: pageRefresh ? defaultStartDate : filterParams.start_date,
        end_date: pageRefresh ? defaultEndDate : filterParams.end_date,
        meter: filterParams.meter,
        page: currentPage,
        page_size: 10
      }

      // console.log(params)
      const [statusCode, response] = await fetchData(params)

      if (statusCode === 200 || statusCode === 204) {
        try {
          setTotalCount(response.data.data.result.count)
          const _temp = response.data.data.result.results

          const key_sequence = [
            "meter_number",
            "reporting_timestamp",
            "meter_timestamp",
            "tamper_events",
            "prepaid_status",
            "credit_zone",
            "fw_version",
            "cumulative_recharge(Rs)",
            "cumulative_consumed_gas(m3)",
            "current_balance_amount(Rs)",
            "current_gas_price",
            "last_updated_gas_price_timestamp",
            "GCV",
            "VCF",
            "signal_strength(dBm)",
            "battery_level_percentage",
            "daily_rental(Rs)",
            "daily_rental_count",
            "max_daily_rental_period",
            "total_daily_rental_deducted(Rs)",
            "free_gas_validity",
            "monthly_free_gas_m3",
            "remaining_free_gas_vol(m3)",
            "monthly_emi_amount(Rs)",
            "monthly_emi_count",
            "monthly_emi_validity",
            "total_monthly_emi_deducted(Rs)",
            "index"
          ]

          const _response_temp = []

          // Iterate through the data array (_temp)
          for (let i = 0; i < _temp.length; i++) {
            const currentItem = _temp[i]
            const updatedItem = {} // Object to hold reordered keys

            // Iterate through the key sequence array to reorder keys
            for (let j = 0; j < key_sequence.length; j++) {
              const key = key_sequence[j]
              if (key in currentItem) {
                updatedItem[key] = currentItem[key]
              } else if (key in currentItem.data) {
                updatedItem[key] = currentItem.data[key]
              } else {
                updatedItem[key] = "--" // Set to null if key not found
              }
            }

            // Convert tamper_events to string if present
            if (updatedItem.hasOwnProperty("tamper_events")) {
              updatedItem["tamper_events"] = updatedItem["tamper_events"].toString()
            }

            // Add index
            updatedItem["index"] = i

            // Push the updated item to the response array
            _response_temp.push(updatedItem)
          }

          setRawResponse(_temp)
          setResponse(_response_temp)
          // setResponse(response.data.data.result.results)
          setFetchingData(false)
          setPageRefresh(false)
          setRetry(false)
        } catch (error) {
          setRetry(false)
          setError(true)
          setErrorMessage("Something went wrong, please retry")
        }
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else {
        setRetry(false)
        setError(true)
        setErrorMessage("Network Error, please retry")
      }
      setLoader(false)
    }
  }, [fetchingData, retry])

  const tblColumn = () => {
    const column = []
    const custom_width = ["blockload_datetime"]
    if (response) {
      for (const i in response[0]) {
        const col_config = {}
        if (i !== "id" && i !== "daily_reading_data" && i !== "meter_serial_number") {
          col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll("_", " ")
          col_config.serch = i
          col_config.sortable = true
          // col_config.reorder = true
          col_config.width = "180px"
          col_config.selector = (row) => row[i]
          col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)

          // if (custom_width.includes(i)) {
          //   col_config.width = "290px"
          // }
          // col_config.width = "250px"

          if (i === "tamper_events" || i === "credit_zone") {
            col_config.width = "300px"
          }
          if (i === "credit_zone") {
            col_config.width = "200px"
          }

          if (i === response[i]) {
            return <div className='font-weight-bold w-100'>{row[i] ? row[i] : "--"}</div>
          }
          col_config.cell = (row) => {
            if (i === "tamper_events") {
              // console.log(row.command)
              return (
                <div className='d-flex' data-tag='allowRowEvents'>
                  {row[i]}
                </div>
                // <div
                //   className='font-weight-bold w-100'
                //   title={
                //     row[i]
                //       ? row[i] !== ""
                //         ? row[i].toString().length > 20
                //           ? row[i]
                //           : ""
                //         : "-"
                //       : "-"
                //   }
                // >
                //   {row[i] && row[i] !== "" ? row[i].toString().substring(0, 20) : "-"}
                //   {row[i] && row[i] !== "" ? (row[i].toString().length > 20 ? "..." : "") : "-"}
                // </div>
              )
            }

            return (
              <div className='d-flex' data-tag='allowRowEvents'>
                {row[i]}
              </div>
            )
          }
          column.push(col_config)
        }
      }
      column.unshift({
        name: "Sr No",
        width: "90px",
        sortable: false,
        cell: (row, i) => {
          return (
            <div className='d-flex justify-content-center'>{i + 1 + 10 * (currentPage - 1)}</div>
          )
        }
      })

      // column.push({
      //   name: 'View Consumption',
      //   maxWidth: '100px',
      //   style: {
      //     minHeight: '40px',
      //     maxHeight: '40px'
      //   },
      //   cell: (row, index) => {
      //     return <Eye size='20' className='ml-1 cursor-pointer' onClick={() => showConsumptionData(row, index)} />
      //   }
      // })
    }

    return column
  }

  const onNextPageClicked = (number) => {
    setCurrentPage(number + 1)
    setFetchingData(true)
  }

  const reloadData = () => {
    setCurrentPage(1)
    setFetchingData(true)
    setPageRefresh(true)
  }

  const onSubmitButtonClicked = (filterParams) => {
    setFilterParams(filterParams)
    setCurrentPage(1)
    setFetchingData(true)
  }

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }

  const handleReportDownloadModal = () => {
    setShowReportDownloadModal(!showReportDownloadModal)
  }

  const onRowClicked = (rowSelected) => {
    // console.log('Row Selected Index .....')
    // console.log(rowSelected.index)
    // console.log(rawResponse)
    // console.log(rawResponse[rowSelected.index]['data'].daily_reading_data)
    setRowSelected(rawResponse[rowSelected.index]["data"].daily_reading_data)
    setCenteredModal(!centeredModal)
  }

  // custom Close Button for Report Download Modal
  const CloseBtnForReportDownload = (
    <X className='cursor-pointer mt_5' size={15} onClick={handleReportDownloadModal} />
  )

  return (
    <>
      <Card className='p-2'>
        <CommonFilter
          onSubmitButtonClicked={onSubmitButtonClicked}
          hideCommandStatusFilter={true}
        />
        {loader ? (
          <Loader hight='min-height-330' />
        ) : hasError ? (
          <CardInfo
            props={{
              message: { errorMessage },
              retryFun: { retryAgain },
              retry: { retry }
            }}
          />
        ) : (
          !retry && (
            <div className='table-wrapper'>
              <GasMeteringPaginatedTable
                columns={tblColumn()}
                tblData={response}
                rowCount={pageSize}
                tableName={"Push Data"}
                refresh={reloadData}
                currentPage={currentPage}
                totalCount={totalCount}
                onNextPageClicked={onNextPageClicked}
                onRowClicked={onRowClicked}
              />
            </div>
          )
        )}
      </Card>

      <Modal
        isOpen={centeredModal}
        toggle={() => setCenteredModal(!centeredModal)}
        className={`modal_size modal-dialog-centered`}
      >
        <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>Consumption Data</ModalHeader>
        <ModalBody>
          <PushDataConsumptionTable response={rowSelected} />
        </ModalBody>
      </Modal>
    </>
  )
}

export default PushData
