import { useState, useEffect } from "react"
import Loader from "@src/views/project/misc/loader"
import SimpleDataTable from "@src/views/ui-elements/dtTable/simpleTable"
import BillDetermineActionModal from "@src/views/project/utility/module/mdms/userProfile/wrapper/billDetermineActionModal"
import { Eye } from "react-feather"

import Toast from "@src/views/ui-elements/cards/actions/createToast"
import { toast } from "react-toastify"
import useJwt from "@src/auth/jwt/useJwt"

import {
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  Button,
  InputGroup,
  Label,
  Card,
  CardBody
} from "reactstrap"
import Flatpickr from "react-flatpickr"

import { useSelector, useDispatch } from "react-redux"

import { useLocation, useHistory } from "react-router-dom"
import authLogout from "../../../../../../../auth/jwt/logoutlogic"
import { caseInsensitiveSort } from "@src/views/utils.js"
import CardInfo from "@src/views/ui-elements/cards/actions/cardInfo"
import moment from "moment"
const BillDetermine = (props) => {
  const dispatch = useDispatch()
  const history = useHistory()

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const selected_month = useSelector((state) => state.calendarReducer.month)
  const HierarchyProgress = useSelector(
    (state) => state.UtilityMDMSHierarchyProgressReducer.responseData
  )

  let user_name = ""
  let meter_serial = ""
  if (HierarchyProgress && HierarchyProgress.user_name) {
    user_name = HierarchyProgress.user_name
    meter_serial = HierarchyProgress.meter_serial_number
  }
  const [centeredModal, setCenteredModal] = useState(false)
  const [eventHistoryStartTime, setEventHistoryStartTime] = useState(undefined)
  const [eventHistoryEndTime, setEventHistoryEndTime] = useState(undefined)

  // Local State to manage Billing Determinant History
  const [BillingDeterminantHistory, setBillingDeterminantHistory] = useState([])
  const [fetchingData, setFetchingData] = useState(false)
  const [rowCount, setRowCount] = useState(6)
  const [page, setPage] = useState(0)

  const defaultStartDate = moment().startOf("month").format("YYYY-MM-DD 00:00:00")

  // Set default end date to the current date and time
  const defaultEndDate = moment().format("YYYY-MM-DD HH:mm:ss")

  // console.log("Default End Date:", defaultStartDate)
  const [startDateTime, setStartDateTime] = useState(defaultStartDate)
  // console.log("Default End Date:", defaultEndDate)
  const [endDateTime, setEndDateTime] = useState(defaultEndDate)

  const [loader, setLoader] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [hasError, setError] = useState(false)
  const [retry, setRetry] = useState(false)

  const fetchData = async (params) => {
    return await useJwt
      .getMDMSUserBillingData(params)
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

  useEffect(async () => {
    // if (!BillingDeterminantHistory || BillingDeterminantHistory.length <= 0) {
    // Fetch Billing Determinant History
    setLoader(true)
    const params = {
      project: HierarchyProgress.project_name,
      // sc_no: HierarchyProgress.user_name,
      page: 1,
      page_size: 10,
      start_date: startDateTime,
      end_date: endDateTime,
      site: HierarchyProgress.dtr_name,
      meter: HierarchyProgress.meter_serial_number
    }
    const [statusCode, response] = await fetchData(params)
    if (statusCode === 200) {
      try {
        const billingDataResponse = []
        const results = response.data.data.result.results // Assuming this is an array of objects

        const command_sequence = {
          billing_datetime: "Billing_Date",
          systemPF: "Average_Power_Factor_For_Billing_Period",
          kwhSnap: "Cum._Active_Imp._Energy_(kWh)",
          import_Wh_TOD_1: "Cum._Active_Imp._Energy_(kWh)_T1",
          import_Wh_TOD_2: "Cum._Active_Imp._Energy_(kWh)_T2",
          import_Wh_TOD_3: "Cum._Active_Imp._Energy_(kWh)_T3",
          import_Wh_TOD_4: "Cum._Active_Imp._Energy_(kWh)_T4",
          kvahSnap: "Cum._Apparent_Imp._Energy_(kVAh)",
          import_VAh_TOD_1: "Cum._Apparent_Imp._Energy_(kVAh)_T1",
          import_VAh_TOD_2: "Cum._Apparent_Imp._Energy_(kVAh)_T2",
          import_VAh_TOD_3: "Cum._Apparent_Imp._Energy_(kVAh)_T3",
          import_VAh_TOD_4: "Cum._Apparent_Imp._Energy_(kVAh)_T4",
          MDKwh: "MD_kW",
          MDKwhTS: "MD_kW_with_Date/Time",
          MDKvah: "MD_kVA",
          MDKvahTS: "MD_kVA_with_Date/Time",
          billingDuration: "Billing_Power_ON_Duration_(Minutes)",
          kwhSnapExport: "Cum._Active_Exp._Energy_(kWh)",
          kvahSnapExport: "Cum._Apparent_Exp._Energy_(kVAh)",
          date_timestamp: "data_timestamp",
          reporting_timestamp: "report_timestamp"
        }
        const keysToConvertWh = [
          "MD_kW",
          "Average_Power_Factor_For_Billing_Period",
          "Cum._Active_Imp._Energy_(kWh)",
          "Cum._Active_Imp._Energy_(kWh)_T1",
          "Cum._Active_Imp._Energy_(kWh)_T2",
          "Cum._Active_Imp._Energy_(kWh)_T3",
          "Cum._Active_Imp._Energy_(kWh)_T4",
          "Cum._Active_Exp._Energy_(kWh)"
        ]
        const keysToConvertVAh = [
          "MD_kVA",
          "Cum._Apparent_Imp._Energy_(kVAh)",
          "Cum._Apparent_Imp._Energy_(kVAh)_T1",
          "Cum._Apparent_Imp._Energy_(kVAh)_T2",
          "Cum._Apparent_Imp._Energy_(kVAh)_T3",
          "Cum._Apparent_Imp._Energy_(kVAh)_T4",
          "Cum._Apparent_Exp._Energy_(kVAh)"
        ]

        for (let i = 0; i < results.length; i++) {
          const item = results[i].data
          item.reporting_timestamp = results[i].report_timestamp
          // Check if item is an object (not an array)
          if (typeof item === "object" && item !== null) {
            if (item.hasOwnProperty("total_poweron_duraion_min")) {
              item["Total power on duration"] = item["total_poweron_duraion_min"]
              delete item["total_poweron_duraion_min"]
            }
            for (const key in item) {
              if (command_sequence.hasOwnProperty(key)) {
                const commandSequence = command_sequence[key]

                if (keysToConvertWh && keysToConvertWh.includes(commandSequence)) {
                  // Convert from Wh to kWh
                  item[commandSequence] = item[key] / 1000
                  if (item[key] !== 0) {
                    item[commandSequence] = item[commandSequence]?.toFixed(4)
                  }
                } else if (keysToConvertVAh && keysToConvertVAh.includes(commandSequence)) {
                  // Convert from VAh to kVAh
                  item[commandSequence] = item[key] / 1000
                  if (item[key] !== 0) {
                    item[commandSequence] = item[commandSequence]?.toFixed(4)
                  }
                } else {
                  item[commandSequence] = item[key]
                }
                // If the key is different from the mapped key, delete it
                if (commandSequence !== key) {
                  delete item[key]
                }
              }
              if (item[key] === "65535-00-00 00:00:00") {
                item[key] = "--"
              }
            }
            billingDataResponse.push(item)
          }
        }
        setBillingDeterminantHistory(billingDataResponse)
        setFetchingData(false)
        setRetry(false)
      } catch (error) {
        setRetry(false)
        setError(true)
        setErrorMessage("Something went wrong, please retry")
      }
      // setFetchDailyData(false)
    } else if (statusCode === 401 || statusCode === 403) {
      setLogout(true)
    } else {
      setRetry(false)
      setError(true)
      setErrorMessage("Network Error, please retry")
    }
    setLoader(false)
    // }
  }, [retry, fetchingData])

  const tblColumn = () => {
    const column = []
    const custom_width = [
      "BD_GENERATED_TIME",
      "from_datetime",
      "to_datetime",
      "MR_SCHEDULE_DATE",
      "READ_DATE",
      "actual_read_date",
      "MRU"
    ]

    if (BillingDeterminantHistory && BillingDeterminantHistory.length > 0) {
      for (const i in BillingDeterminantHistory[0]) {
        const col_config = {}
        if (i !== "id" && i !== "METER_NUMBER" && i !== "meter_number") {
          col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll("_", " ")
          col_config.serch = i
          col_config.sortable = true
          col_config.wrap = true
          col_config.selector = (row) => row[i]
          col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)
          // col_config.selector = i
          col_config.style = {
            minHeight: "40px",
            maxHeight: "40px"
          }
          // col_config.width = "100px"

          // if (custom_width.includes(i)) {
          //   col_config.width = "250px"
          // }

          col_config.width = "160px"

          col_config.cell = (row) => {
            return (
              <div className='d-flex'>
                <span className='d-block font-weight-bold '>
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

      const showData = async (row) => {
        setEventHistoryStartTime(row["from_datetime"])
        setEventHistoryEndTime(row["to_datetime"])

        setCenteredModal(true)
      }

      // column.push({
      //   name: "View",
      //   maxWidth: "100px",
      //   style: {
      //     minHeight: "40px",
      //     maxHeight: "40px"
      //   },
      //   cell: (row) => {
      //     return (
      //       <Eye
      //         size='20'
      //         className='ml_8 cursor-pointer text-primary'
      //         onClick={() => showData(row)}
      //       />
      //     )
      //   }
      // })
      column.unshift({
        name: "Sr",
        width: "90px",
        cell: (row, i) => {
          return <div className='d-flex  justify-content-center'>{page * rowCount + 1 + i}</div>
        }
      })
      return column
    }
  }

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }

  const onDateRangeSelectedButtonPressed = () => {
    if (startDateTime && endDateTime) {
      setFetchingData(true)
    } else {
      toast.error(<Toast msg='Invalid DateTime Range' type='danger' />, {
        hideProgressBar: true
      })
    }
  }
  const reloadData = () => {
    setFetchingData(true)
  }

  //

  const onDateRangeSelected = (dateRange) => {
    if (dateRange.length === 1) {
      setStartDateTime(moment(dateRange[0]).format("YYYY-MM-DD HH:mm:ss"))
      setEndDateTime(undefined)
    } else if (dateRange.length === 2) {
      setStartDateTime(moment(dateRange[0]).format("YYYY-MM-DD HH:mm:ss"))
      setEndDateTime(moment(dateRange[1]).format("YYYY-MM-DD HH:mm:ss"))
    }
  }

  const onSubmitButtonClicked = () => {
    // console.log("On Submit Button Clicked ...")
    if (startDateTimeAsPerFormat && !endDateTimeAsPerFormat) {
      // Set End Time Error
      toast.error(<Toast msg='Please Select End Time' type='danger' />, {
        hideProgressBar: true
      })
    } else if (!startDateTimeAsPerFormat && endDateTimeAsPerFormat) {
      // Set Start Time Error
      toast.error(<Toast msg='Please Select Start Time' type='danger' />, {
        hideProgressBar: true
      })
    } else if (startDateTimeAsPerFormat && endDateTimeAsPerFormat) {
      // Both Time are set Compare
      if (startDateTimeAsPerFormat > endDateTimeAsPerFormat) {
        toast.error(
          <Toast msg='Start Date Time should be smaller than End Date Time' type='danger' />,
          { hideProgressBar: true }
        )
      } else {
        setBillingDeterminantHistory([])
        reloadData()
      }
      // toast.error(<Toast msg='Please enter meter serial.' type='danger' />, { hideProgressBar: true })
    } else {
      // Both the time are not set look for only data position value
      // toast.error(<Toast msg='Please enter meter serial.' type='danger' />, { hideProgressBar: true })
      reloadData()
    }
  }

  return (
    <div>
      {loader ? (
        <Loader hight='min-height-484' />
      ) : hasError ? (
        <CardInfo
          props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }}
        />
      ) : (
        !retry && (
          <>
            <Row className='justify-content-end mb-1'>
              <Col md='5'>
                <InputGroup>
                  <Flatpickr
                    placeholder='Select date ...'
                    onChange={onDateRangeSelected}
                    className='form-control'
                    value={[startDateTime, endDateTime]}
                    options={{ mode: "range", enableTime: true, time_24hr: true }}
                  />
                  <Button color='primary' outline onClick={onDateRangeSelectedButtonPressed}>
                    Go
                  </Button>
                </InputGroup>
              </Col>
            </Row>

            <SimpleDataTable
              columns={tblColumn()}
              tblData={BillingDeterminantHistory}
              rowCount={rowCount}
              currentpage={page}
              ispagination
              selectedPage={setPage}
              additional_columns={["METER_NUMBER"]}
              tableName={"Billing Data Table".concat("(", meter_serial, ")")}
              defaultSortFieldId='datetime'
              height={true}
              retry={""}
            />
          </>
        )
      )}
      {/* Show All the events for Billing determinants generated for time interval */}
      {centeredModal && (
        <BillDetermineActionModal
          isOpen={centeredModal}
          handleModal={setCenteredModal}
          eventHistoryStartTime={eventHistoryStartTime}
          eventHistoryEndTime={eventHistoryEndTime}
          txtLen={50}
        />
      )}
    </div>
  )
}

export default BillDetermine
