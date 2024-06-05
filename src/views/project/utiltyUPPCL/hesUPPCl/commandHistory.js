import React, { useEffect, useState, Fragment } from "react"
import { Col, Row, Modal, ModalHeader, ModalBody, UncontrolledTooltip, Button } from "reactstrap"
import useJwt from "@src/auth/jwt/useJwt"
import { useLocation, useHistory } from "react-router-dom"
import SimpleDataTableMDAS from "@src/views/ui-elements/dtTable/simpleTableMDASUpdated"
import { Eye, X, Layers, Download } from "react-feather"
// import CreateTable from '@src/views/ui-elements/dtTable/createTable'
import SimpleTableForDLMSCommandResponse from "@src/views/ui-elements/dtTable/simpleTableForDLMSCommandResponse"
import Timeline from "@components/timeline"
import SchedulerList from "../../utility/module/hes/wrappers/meterConfigurationWrapper/schedulerList"
import FilterForm from "@src/views/project/utiltyUPPCL/hesUPPCl/commandFilterWrapper/filterForm.js"
import { useSelector, useDispatch } from "react-redux"
import CardInfo from "@src/views/ui-elements/cards/actions/cardInfo"

import authLogout from "../../../../auth/jwt/logoutlogic"

import Loader from "@src/views/project/misc/loader"
import { caseInsensitiveSort } from "@src/views/utils.js"

import CommandRetryConfig from "../../utility/module/hes/wrappers/commandRetryConfigWrapper/commandRetryConfig"

import CommandHistoryDataDownloadWrapper from "../../utility/module/hes/wrappers/dataDownloadWrapper/commandHistoryDataDownloadWrapper"

import moment from "moment-timezone"
import { toast } from "react-toastify"
import Toast from "@src/views/ui-elements/cards/actions/createToast"

// import { DLMSCommandMapping } from '../util'

const CommandHistory = (props) => {
  // console.log('Protocol Selected ....')
  // console.log(props.protocol)

  const dispatch = useDispatch()
  const history = useHistory()

  const diffTimeSec = [2, 3, 4, 5, 6]

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  // const responseData = useSelector(state => state.UtilityMdmsFlowReducer)
  const responseData = useSelector((state) => state.UtilityMDASAssetListReducer)
  const currentSelectedModuleStatus = useSelector(
    (state) => state.CurrentSelectedModuleStatusReducer.responseData
  )

  const location = useLocation()
  const projectName =
    location.pathname.split("/")[2] === "sbpdcl" ? "ipcl" : location.pathname.split("/")[2]

  const [reloadCommandHistory, setReloadCommandHistory] = useState(true)

  const [histyData, setHistyData] = useState()
  const [tapHistyData, setTapHistyData] = useState(undefined)
  const [centeredModal, setCenteredModal] = useState(false)
  const [tapViewModal, setTapViewModal] = useState(false)
  const [centeredSchedulerModal, setCenteredSchedulerModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filterModal, setFilterModal] = useState(false)
  const [filterAppliedParams, setFilterAppliedParams] = useState(undefined)
  const [schedulerState, setSchedulerState] = useState(false)

  const [tableName, setTableName] = useState("Command History")
  const [tableNameUpdated, setTableNameUpdated] = useState(false)

  const [hasError, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [retry, setRetry] = useState(true)
  const [selectedAssetType, setSelectedAssetType] = useState("dtr")
  const [rowExecutionStatus, setRowExecutionStatus] = useState([])

  // const [protocolSelectionOption, setProtocolSelectionOption] = useState(props.selectProtocol)

  const [selected_project, set_selected_project] = useState(undefined)

  const [commandRetryConfigModal, setCommandRetryConfigModal] = useState(false)

  const [showReportDownloadModal, setShowReportDownloadModal] = useState(false)

  const [commandSelectedToViewResponse, setCommandSelectedToViewResponse] = useState("")

  const [commandName, setCommandName] = useState("")

  const [loading, setLoading] = useState(false)

  const [previousPageBtn, setPreviousPageBtn] = useState()
  const [nextPageBtn, setNextPageBtn] = useState()
  const [isvalue, setIsValue] = useState("")

  const currentTime = moment().tz("Asia/Kolkata")

  // Format the time
  const istTime = currentTime.format("YYYY-MM-DD HH:mm:ss")

  const handleReportDownloadModal = () => {
    setShowReportDownloadModal(!showReportDownloadModal)
  }

  if (props.tableName && !tableNameUpdated) {
    setTableName(props.tableName)
    setTableNameUpdated(true)
  }

  // TotalCount,response Local State
  const [response, setResponse] = useState([])
  const [totalCount, setTotalCount] = useState(0)

  const protocolSelected = (value) => {
    // setProtocol(value)
    props.protocolSelectedForCommandExecution(value)
    // setReloadCommandHistory(true)
    setCurrentPage(1)
    setResponse([])
    setTotalCount(0)
    setFilterAppliedParams(undefined)
  }

  if (currentSelectedModuleStatus.prev_project) {
    if (
      selected_project !== currentSelectedModuleStatus.project &&
      currentSelectedModuleStatus.prev_project !== currentSelectedModuleStatus.project
    ) {
      set_selected_project(currentSelectedModuleStatus.project)
      setError(false)
      protocolSelected("dlms")
    }
  }

  const fetchCommandHistoryDLMS = async (params) => {
    return await useJwt
      .getCommandHistoryData(params)
      .then((res) => {
        const status = res.status

        return [status, res]
      })
      .catch((err) => {
        if (err.response) {
          if (err.response.data.responseCode === 404) {
            const status = err.response.status
            return [status, err.response.data.data.result.Error]
          } else {
            const status = err.response.status
            return [status, err]
          }
        } else {
          return [0, err]
        }
      })
  }

  const fetchCommandHistoryTAP = async (params) => {
    return await useJwt
      .getMdasTapCommandHistory(params)
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

  const fetchHistoryData = async (params) => {
    return await useJwt
      .getCommandExecutionResp(params)
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

  const fetchHistoryDataDetail = async (params) => {
    return await useJwt
      .commandHistoryTAPDetail(params)
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
  const AppliedFilterparams = (params, resetcalled) => {
    // console.log('Filtered Params Dictionary ...')
    // console.log(params)
    if (resetcalled) {
      setFilterAppliedParams(params)
      // setReloadCommandHistory(true)
      // setRetry(true)
      props.refreshCommandHistory()
      setCurrentPage(1)
      setResponse([])
      setTotalCount(0)
    } else {
      if (params) {
        setFilterAppliedParams(params)
        setRetry(true)
        // setReloadCommandHistory(true)
        // props.refreshCommandHistory()
        setCurrentPage(1)
        setResponse([])
        setTotalCount(0)
      }
    }
  }

  useEffect(() => {
    setRetry(true)
  }, [props.reloadCommandHistory])

  const fetchDlms = async (params) => {
    const [statusCode, response] = await fetchCommandHistoryDLMS(params)

    if (statusCode === 401 || statusCode === 403) {
      setLogout(true)
    }
    if (statusCode === 200) {
      try {
        // Handle the response for status code 200
        response?.data?.data?.result?.results?.map((item) => {
          const updateMoment = moment(item.updated_at, "YYYY-MM-DD HH:mm:ss").tz("Asia/Kolkata")
          if (updateMoment.isAfter(currentTime)) {
            item.updated_at = item.start_time
            item.status = "IN_PROGRESS"
          }
          return item
        })

        setResponse(response?.data?.data?.result?.results)
        setTotalCount(response?.data.data.result.count)

        // Additional logic for status code 200
        // Get the cursor value
        const previousUrlParams = new URLSearchParams(response?.data?.data?.result?.previous)
        const previousCursorValue = previousUrlParams.get("cursor")
        setPreviousPageBtn(previousCursorValue)
        const nextUrlParams = new URLSearchParams(response?.data?.data?.result?.next) // Get the cursor value
        const nextCursorValue = nextUrlParams.get("cursor")
        setNextPageBtn(nextCursorValue)
        if (response?.data?.data?.result?.previous === null) {
          setCurrentPage(1)
        }
        setLoading(false)
        setRetry(false)
        setError(false)
      } catch (error) {
        setLoading(false)
        setRetry(false)
        setError(true)
        setErrorMessage("Something went wrong, please retry")
      }
    } else if (statusCode === 404) {
      toast.error(<Toast msg={`${response}`} type='danger' />, {
        hideProgressBar: true
      })
      setLoading(false)
      setRetry(false)
      setError(false)
    } else {
      setLoading(false)
      setRetry(false)
      setError(true)
      setErrorMessage("Network Error, please retry")
    }
  }

  const fetchTap = async (params) => {
    const [statusCode, response] = await fetchCommandHistoryTAP(params)

    if (statusCode) {
      if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else if (statusCode === 200 || statusCode === 204) {
        setResponse(response.data.data.result.results)
        setTotalCount(response.data.data.result.count)
        props.doNotRefreshCommandHistory()
        setLoading(false)
        setRetry(false)
        setError(false)
      } else {
        setLoading(false)
        setRetry(false)
        setError(true)
        setErrorMessage("Network Error, please retry")
      }
    }
  }

  useEffect(() => {
    if (retry) {
      setLoading(true)
      let params = {}
      if (filterAppliedParams) {
        if ("site_id" in filterAppliedParams) {
          params = {
            project: projectName,
            cursor:
              isvalue === ""
                ? undefined
                : isvalue === "pre"
                ? previousPageBtn
                : isvalue === "next"
                ? nextPageBtn
                : undefined,
            ...filterAppliedParams //Add Filter params
          }
        } else {
          const dtr_list = ""
          params = {
            project: projectName,
            site_id: dtr_list,
            cursor:
              isvalue === ""
                ? undefined
                : isvalue === "pre"
                ? previousPageBtn
                : isvalue === "next"
                ? nextPageBtn
                : undefined,
            ...filterAppliedParams //Add Filter params
          }
        }
      } else {
        params = {
          project: projectName,
          asset_type: "dtr",
          cursor:
            isvalue === ""
              ? undefined
              : isvalue === "pre"
              ? previousPageBtn
              : isvalue === "next"
              ? nextPageBtn
              : undefined
        }
      }

      params = props.params ? props.params : params

      if (props.protocol === "dlms") {
        fetchDlms(params)
      } else if (props.protocol === "tap") {
        fetchTap(params)
      }
    }
  }, [retry])

  const tblColumn = () => {
    const column = []
    const custom_width = ["timestamp", "execution_time"]

    // console.log(response)
    if (response.length > 0) {
      // console.log('REsponse ....')
      // console.log(response)

      for (const i in response[0]) {
        const col_config = {}
        if (i !== "id") {
          col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll("_", " ")
          col_config.serch = i
          // col_config.selector = i
          col_config.selector = (row) => row[i]
          col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)
          col_config.sortable = true
          col_config.reorder = true
          col_config.wrap = true
          col_config.compact = false

          col_config.width = "180px"
          if ((i === "command" || i === "params") && props.protocol === "dlms") {
            col_config.width = "250px"
          } else if ((i === "command" || i === "params") && props.protocol === "tap") {
            col_config.width = "200px"
          } else if (i.toLowerCase() === "user") {
            col_config.width = "200px"
          }
          // col_config.style = {
          //   maxWidth:'200000px'
          // }
          // col_config.style = {
          //   minHeight: '40px',
          //   maxHeight: '60px'
          // }

          if (custom_width.includes(i)) {
            col_config.width = "200px"
          }

          col_config.cell = (row) => {
            // console.log('Printing Row ....')
            // console.log(row)

            return (
              <div className='d-flex'>
                <span
                  className='d-block font-weight-bold '
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
                  {row[i] !== 0
                    ? row[i] && row[i] !== ""
                      ? row[i].toString().substring(0, 25) +
                        (row[i].toString().length > 25 ? "..." : "")
                      : "-"
                    : row[i]}
                </span>
              </div>
            )
          }
          column.push(col_config)
        }
      }

      column.push({
        name: "Response Time",
        width: "140px",
        position: 5,
        cell: (row) => {
          if (!["SUCCESS", "FAILED", "PARTIAL_SUCCESS"].includes(row.status)) {
            return <>-</>
          }
          if (row.start_time && row.updated_at) {
            const timeDifferenceInSeconds = moment(row.updated_at).diff(row.start_time, "seconds")
            const hours = Math.floor(timeDifferenceInSeconds / 3600)
            const minutes = Math.floor((timeDifferenceInSeconds % 3600) / 60)
            const seconds = timeDifferenceInSeconds % 60
            return (
              <>
                {hours ? `${hours} ${hours === 1 ? "hr" : "hrs"}` : ""}{" "}
                {minutes ? `${minutes} min` : ""} {`${seconds} sec`}
              </>
            )
          } else {
            return <>N/A</>
          }
        }
      })

      // const showData = async (row) => {
      //   const params = {
      //     id: row.id
      //   };
      //   const [statusCode, response] = await fetchHistoryData(params);
      //   setCenteredModal(true);
      //   if (statusCode === 200) {
      //     const data = response.data.data.result;
      //     data[
      //       "cmd_detail"
      //     ] = Meter:  ${row.meter_number}, Command: ${row.command}, Execution: ${row.start_time};
      //     // DLMSCommandMapping(row.command, response.data.data.result)
      //     setCommandSelectedToViewResponse(row.command);
      //     setHistyData(response.data.data.result);
      //   } else if (statusCode === 401 || statusCode === 403) {
      //     setLogout(true);
      //   }
      // };

      const showData = async (row) => {
        // console.log("DLMS Data .....")

        const params = {
          id: row.id
        }
        const [statusCode, response] = await fetchHistoryData(params)

        setCenteredModal(true)
        if (statusCode === 200 || statusCode === 202) {
          const data = response?.data?.data?.result?.data
          data.map((item) => {
            for (const key in item) {
              if (item[key] === "65535-00-00 00:00:00") {
                item[key] = "--"
              }
              // if (key.includes("import_Wh") || key.includes("import_VAh")) {
              //   item[key] = item[key].toFixed(2);
              // }
            }

            return item
          })
          const cmdDetail = `Meter: ${row.meter_id}, Command: ${row.command_name}, Execution: ${row.start_time}`
          const newData = {
            data,
            cmd_detail: cmdDetail
          }
          setCommandName(row.command_name)
          setRowExecutionStatus(row)
          setCommandSelectedToViewResponse(row.command_name)
          setHistyData(newData)
        } else if (statusCode === 401 || statusCode === 403) {
          setLogout(true)
        }
      }

      const showTapData = async (row) => {
        // console.log("TAP Data .....")

        const params = {
          id: row.id,
          project: projectName
        }
        const [statusCode, response] = await fetchHistoryDataDetail(params)
        setTapViewModal(true)
        if (statusCode === 200) {
          const data = response.data.data.result
          data["cmd_detail"] = {
            meter_serial: row.meter_serial,
            command: row.command,
            execution: row.execution_time
          }
          setTapHistyData(data)
        } else if (statusCode === 401 || statusCode === 403) {
          setLogout(true)
        }
      }
      if (props.protocol === "dlms") {
        column.push({
          name: "Action",
          maxWidth: "100px",
          style: {
            minHeight: "40px",
            maxHeight: "40px"
          },
          cell: (row) => {
            return <Eye size='20' className='ml-1 cursor-pointer' onClick={() => showData(row)} />
          }
        })
      }

      if (props.protocol === "tap") {
        column.push({
          name: "Action",
          maxWidth: "100px",
          style: {
            minHeight: "40px",
            maxHeight: "40px"
          },
          cell: (row) => {
            return (
              <Eye size='20' className='ml-1 cursor-pointer' onClick={() => showTapData(row)} />
            )
          }
        })
      }
    }

    column.unshift({
      name: "Sr No.",
      width: "90px",
      sortable: false,
      cell: (row, i) => {
        return <div className='d-flex justify-content-center'>{i + 1 + 10 * (currentPage - 1)}</div>
      }
    })

    return column
  }

  const isArray = (a) => {
    return !!a && a.constructor === Array
  }

  const eventsRelated = (info) => {
    if (info === "CEFV") {
      return "Current Related Events"
    } else if (info === "VEFV") {
      return "Voltage Related Events"
    } else if (info === "PEFV") {
      return "Power Related Events"
    } else if (info === "TEFV") {
      return "Transaction Related events"
    } else if (info === "NREFV") {
      return "Non Rollover Related Event"
    } else if (info === "DEFV") {
      return "Control Related events"
    } else if (info === "OEFV") {
      return "Other Related events"
    } else {
      return ""
    }
  }
  const commandSequence = {
    meter_current_datetime: "RTC",
    meter_number: "meter_number",
    voltage: "Voltage_(V)",
    phase_current: "Phase_Current_(A)",
    neutral_current: "Neutral_Current_(A)",
    PF: "Signed_Power_Factor",
    frequency: "Frequency_(Hz)",
    apparent_power_VA: "Apparent_Power_KVA",
    active_power_W: "Active_Power_kW",
    import_Wh: "Cum.Active_Imp._Energy(kWh)",
    import_VAh: "Cum.Apparent_Imp._Energy(kVAh)",
    MD_W: "MD_KW",
    MD_W_datetime: "MD_(kW)Date&_Time",
    MD_VA: "MD_KVA",
    MD_VA_datetime: "MD_(kVA)Date&_Time",
    cumm_power_on_dur_minute: "Cumulative_Power_ON_Duration_(Minute)",
    cumm_tamper_count: "Cumulative_Tamper_Count",
    cumm_billing_count: "Cumulative_Billing_Count",
    cumm_programming_count: "Cumulative_Programming_Count",
    export_Wh: "Cum.Active_Exp._Energy(kWh)",
    export_VAh: "Cum.Apparent_Exp._Energy(kVAh)",
    load_limit_func_status: "Load_Limit_Function_Status_(1=Closed)_(0=Open)",
    load_limit_value: "Load_Limit_Value_(kW)",
    data_type: "data_type"
  }

  const key_sequence = [
    "RTC",
    "meter_number",
    "Voltage_(V)",
    "Phase_Current_(A)",
    "Neutral_Current_(A)",
    "Signed_Power_Factor",
    "Frequency_(Hz)",
    "Apparent_Power_KVA",
    "Active_Power_kW",
    "Cum.Active_Imp._Energy(kWh)",
    "Cum.Apparent_Imp._Energy(kVAh)",
    "MD_KW",
    "MD_(kW)Date&_Time",
    "MD_KVA",
    "MD_(kVA)Date&_Time",
    "Cumulative_Power_ON_Duration_(Minute)",
    "Cumulative_Tamper_Count",
    "Cumulative_Billing_Count",
    "Cumulative_Programming_Count",
    "Cum.Active_Exp._Energy(kWh)",
    "Cum.Apparent_Exp._Energy(kVAh)",
    "Load_Limit_Function_Status_(1=Closed)_(0=Open)",
    "Load_Limit_Value_(kW)",
    "data_type"
  ]
  const historyData = (historyData) => {
    const data = historyData?.data?.data ? historyData?.data?.data : historyData?.data

    const tableData = {}
    try {
      for (const i of data) {
        if (i["data_type"] in tableData) {
          tableData[i["data_type"]].push(i)
        } else {
          tableData[i["data_type"]] = [i]
        }
      }
    } catch (err) {}

    return data ? (
      !isArray(data) ? (
        <Col sm='12'>
          {Object.keys(data).length !== 0 ? (
            commandName === "PROFILE_INSTANT" && rowExecutionStatus.status === "Success" ? (
              key_sequence.map((info, index) => {
                const infoKey = Object.keys(commandSequence).find(
                  (key) => commandSequence[key] === info
                )
                if (!infoKey || (commandName === "NAME_PLATE_DETAIL" && infoKey === "data_type")) {
                  return null
                }

                return (
                  <Row key={index}>
                    <Col sm='4' className='text-right border py-1'>
                      {`${info.charAt(0).toUpperCase()}${info.slice(1)}`.replaceAll("_", " ")}
                    </Col>
                    <Col sm='8' className='border py-1'>
                      <h5 className='m-0'>{data[infoKey]}</h5>
                    </Col>
                  </Row>
                )
              })
            ) : (
              Object.keys(data).map((info, index) => {
                if (commandName === "NAME_PLATE_DETAIL" && info === "data_type") {
                  return null
                }
                return (
                  <Row key={index}>
                    <Col sm='4' className='text-right border py-1'>
                      {`${info.charAt(0).toUpperCase()}${info.slice(1)}`.replaceAll("_", " ")}
                    </Col>
                    <Col sm='8' className='border py-1'>
                      <h5 className='m-0'>{data[info]}</h5>
                    </Col>
                  </Row>
                )
              })
            )
          ) : (
            <h3 className='text-center'>No data found</h3>
          )}
        </Col>
      ) : (
        <Col sm='12' className='mb-3'>
          {data.length > 0 ? (
            Object.keys(tableData).map((info, index) => {
              return (
                <SimpleTableForDLMSCommandResponse
                  key={index}
                  data={tableData[info]}
                  smHeading={true}
                  height='max'
                  tableName={
                    eventsRelated(info)
                      ? ` ${historyData.cmd_detail} {${eventsRelated(info)}}`
                      : `${historyData.cmd_detail}`
                  }
                  rowCount={10}
                  commandName={commandSelectedToViewResponse}
                />
              )
            })
          ) : (
            <h3 className='text-center'>No data found</h3>
          )}
        </Col>
      )
    ) : (
      <div class='row justify-content-center col-lg-12'>
        <h3>No data found</h3>
      </div>
    )
  }

  const execStatus = (data) => {
    return data ? (
      <Col sm='6' className='mt-2'>
        <h3 className='mb-2'>Arguments</h3>
        {Object.keys(data).length !== 0 ? (
          Object.keys(data).map((info, index) => (
            <Row key={index}>
              <Col sm='4' className='text-right border py-1'>
                {`${info.charAt(0).toUpperCase()}${info.slice(1)}`.replaceAll("_", " ")}
              </Col>
              <Col sm='8' className='border py-1'>
                <h5 className='m-0'>{JSON.stringify(data[info])}</h5>
              </Col>
            </Row>
          ))
        ) : (
          <h3 className='text-center'>No data found</h3>
        )}
      </Col>
    ) : (
      ""
    )
  }

  const execTimeLine = (data) => {
    const resp_data = []
    for (const i of data) {
      resp_data.push({
        title: i["status"],
        meta: i["timestamp"]
      })
    }

    return data ? (
      <Col sm='6' className='mt-2'>
        <h3 className='mb-2'>Execution timeline</h3>
        <Timeline data={resp_data} />
      </Col>
    ) : (
      ""
    )
  }

  const fullInfo = () => {
    if (histyData && histyData.hasOwnProperty("data") && Array.isArray(histyData.data)) {
      histyData.data.map((item) => {
        if (item.hasOwnProperty("avg_current") || item.hasOwnProperty("measured_current")) {
          item.avg_current = Number(item.avg_current).toFixed(2)
          item.measured_current = Number(item.measured_current).toFixed(2)
        }
      })
    }
    return (
      <Row>
        {histyData ? historyData(histyData) : ""}
        {/* {histyData ? execStatus(histyData.arguments) : ''} */}
        {/*   {histyData ? execTimeLine(histyData.execution_timeline) : ''} */}
      </Row>
    )
  }

  const updateCommandHistoryStatus = () => {
    // console.log('command history api calling ..........')
    props.refreshCommandHistory()
  }

  const handlePreviousPage = () => {
    // console.log("pre")
    if (previousPageBtn !== null && currentPage !== 1) {
      setCurrentPage(currentPage - 1)
      setIsValue("pre")
      setReloadCommandHistory(true)
      // setRetry(true)
      props.refreshCommandHistory()
    }
  }

  const onNextPageClicked = () => {
    // console.log("pre2")
    if (nextPageBtn !== null) {
      setCurrentPage(currentPage + 1)
      setIsValue("next")
      props.refreshCommandHistory()
      setReloadCommandHistory(true)
      // setRetry(true)
    }
  }
  // ** Function to handle Modal toggle
  const handleFilter = () => setFilterModal(!filterModal)
  // ** Custom close btn
  const CloseBtn = <X className='cursor-pointer mt_5' size={15} onClick={handleFilter} />

  // custom Close Button for Report Download Modal
  const CloseBtnForReportDownload = (
    <X className='cursor-pointer mt_5' size={15} onClick={handleReportDownloadModal} />
  )

  // const scheduler = () => {
  //   return (
  //     <Fragment>
  //       <Layers className='ml-1 float-right mt_9' id='scheduler' size='14' onClick={() => setCenteredSchedulerModal(true)} />
  //       <Tooltip placement='top' isOpen={schedulerState} target='scheduler' toggle={() => setSchedulerState(!schedulerState)}>
  //         Scheduled command list !
  //       </Tooltip>
  //     </Fragment>
  //   )
  // }

  const commandRetryConfiguration = () => {
    return (
      <Fragment>
        <Layers
          className='ml-1 float-right mt_9'
          id='cmdRetries'
          size='14'
          onClick={() => setCommandRetryConfigModal(true)}
        />
        <UncontrolledTooltip
          placement='top'
          // isOpen={commandRetryConfigModal}
          target='cmdRetries'
        >
          {/* toggle={() => setCommandRetryConfigModal(!commandRetryConfigModal)}> */}
          Command Retry Configuration
        </UncontrolledTooltip>
      </Fragment>
    )
  }

  const retryAgain = () => {
    setError(false)
    setRetry(true)
    // props.refreshCommandHistory()
  }

  const tapViewDetail = () => {
    return (
      <div style={{ fontSize: "12px" }}>
        Meter serial : <b>{tapHistyData.cmd_detail.meter_serial}</b>
        <br></br>
        Command : <b>{tapHistyData.cmd_detail.command}</b>
        <br></br>
        Execution time : <b>{tapHistyData.cmd_detail.execution}</b>
        <br></br>
        <br></br>
        Command response: <b>{tapHistyData.data}</b>
      </div>
    )
  }

  return (
    <div>
      {hasError ? (
        <CardInfo
          props={{
            message: { errorMessage },
            retryFun: { retryAgain },
            retry: { retry }
          }}
        />
      ) : (
        <>
          {loading && <Loader hight='min-height-475' />}
          {!retry && !loading && (
            <div className='table-wrapper'>
              <SimpleDataTableMDAS
                columns={tblColumn()}
                tblData={response}
                rowCount={10}
                tableName={tableName}
                refresh={updateCommandHistoryStatus}
                filter={!props.params && handleFilter}
                status={loading}
                currentPage={currentPage}
                totalCount={totalCount}
                nextPreviousButtonShow={true}
                handlePreviousPage={handlePreviousPage}
                onNextPageClicked={onNextPageClicked}
                previousPageBtn={previousPageBtn}
                nextPageBtn={nextPageBtn}
                protocolSelected={protocolSelected}
                protocol={props.protocol}
                extras={commandRetryConfiguration()}
                // extras={SlaReport}
                showSLAReport={true}
                isDownloadModal={props.protocol === "dlms" ? "yes" : ""}
                handleReportDownloadModal={handleReportDownloadModal}
                // extra_in_center={SlaReport()}
              />
            </div>
          )}
        </>
      )}

      {/* Command History data modal (Protocol 1)*/}
      <Modal
        isOpen={centeredModal}
        toggle={() => setCenteredModal(!centeredModal)}
        className={`modal_size modal-dialog-centered`}
      >
        <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>
          Command History data
        </ModalHeader>
        <ModalBody>{fullInfo()}</ModalBody>
      </Modal>

      {/* Command History data modal (Protocol 2)*/}
      <Modal
        isOpen={tapViewModal}
        toggle={() => setTapViewModal(!tapViewModal)}
        className={`modal-dialog-centered`}
      >
        <ModalHeader toggle={() => setTapViewModal(!tapViewModal)}>
          Protocol 2 command response detail
        </ModalHeader>
        <ModalBody>{tapHistyData && tapViewDetail()}</ModalBody>
      </Modal>

      {/* scheduler modal */}
      <Modal
        isOpen={centeredSchedulerModal}
        toggle={() => setCenteredSchedulerModal(!centeredSchedulerModal)}
        className={`modal-xl modal-dialog-centered`}
      >
        <ModalHeader toggle={() => setCenteredSchedulerModal(!centeredSchedulerModal)}>
          List Of Schedulers
        </ModalHeader>
        <ModalBody className='p-0'>
          <SchedulerList />
        </ModalBody>
      </Modal>

      {/* Command Retry Configuration For Protocol 1 Modal */}
      <Modal
        isOpen={commandRetryConfigModal}
        toggle={() => setCommandRetryConfigModal(!commandRetryConfigModal)}
        className={`modal-xl modal-dialog-centered`}
      >
        <ModalHeader toggle={() => setCommandRetryConfigModal(!commandRetryConfigModal)}>
          Command Retry Configuration
        </ModalHeader>
        <ModalBody className='p-0'>
          <CommandRetryConfig />
        </ModalBody>
      </Modal>

      {/* Command filter modal (Protocol 1 & 2) */}
      <Modal
        isOpen={filterModal}
        toggle={handleFilter}
        className='sidebar-md'
        modalClassName='modal-slide-in-left'
        contentClassName='pt-0'
      >
        <ModalHeader className='mb-3' toggle={handleFilter} close={CloseBtn} tag='div'>
          <h4 className='modal-title'>Command history - Filter</h4>
        </ModalHeader>
        <ModalBody className='flex-grow-1'>
          <FilterForm
            handleFilter={handleFilter}
            protocol={props.protocol}
            AppliedFilterparams={AppliedFilterparams}
            filterAppliedParams={filterAppliedParams}
            selectedAssetType={selectedAssetType}
            setSelectedAssetType={setSelectedAssetType}
          />
        </ModalBody>
      </Modal>

      {/* Report Download Request History Modal */}
      <Modal
        isOpen={showReportDownloadModal}
        toggle={handleReportDownloadModal}
        style={{ width: "82%" }}
        modalClassName='modal-slide-in'
        contentClassName='pt-0'
      >
        <ModalHeader
          className='mb-3'
          toggle={handleReportDownloadModal}
          close={CloseBtnForReportDownload}
          tag='div'
        >
          <h4 className='modal-title'>Download (Command History Data)</h4>
        </ModalHeader>
        <ModalBody className='flex-grow-1'>
          <CommandHistoryDataDownloadWrapper />
        </ModalBody>
      </Modal>
    </div>
  )
}

export default CommandHistory
