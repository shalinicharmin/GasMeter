import { Row, Col, Modal, ModalHeader, ModalBody, Button, InputGroup } from "reactstrap"
import moment from "moment"
import Loader from "@src/views/project/misc/loader"
import CreateTable from "@src/views/ui-elements/dtTable/createTable"
import Flatpickr from "react-flatpickr"
import "@styles/react/libs/flatpickr/flatpickr.scss"
import { useContext, useState, useEffect } from "react"
import useJwt from "@src/auth/jwt/useJwt"
import { useSelector, useDispatch } from "react-redux"
import SimpleDataTablePaginated from "@src/views/ui-elements/dtTable/simpleTablePaginated"
import Toast from "@src/views/ui-elements/cards/actions/createToast"
import { toast } from "react-toastify"
import CardInfo from "@src/views/ui-elements/cards/actions/cardInfo"
import { useLocation, useHistory } from "react-router-dom"
import authLogout from "../../../../../../../auth/jwt/logoutlogic"
import { caseInsensitiveSort } from "@src/views/utils.js"

const BlobkLoadModal = (props) => {
  const dispatch = useDispatch()
  const history = useHistory()

  // Error Handling
  const [errorMessage, setErrorMessage] = useState("")
  const [hasError, setError] = useState(false)
  const [retry, setRetry] = useState(false)

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const [fetchingData, setFetchingData] = useState(true)
  const [response, setResponse] = useState([])
  const [totalCount, setTotalCount] = useState(120)
  const [currentPage, setCurrentPage] = useState(1)
  const [startDateTime, setStartDateTime] = useState(undefined)
  const [endDateTime, setEndDateTime] = useState(undefined)

  const [rowCount, setRowCount] = useState(100)
  const selected_month = useSelector((state) => state.calendarReducer.month)
  const HierarchyProgress = useSelector(
    (state) => state.UtilityMDMSHierarchyProgressReducer.responseData
  )

  // console.log('Hierarchy Progress .....')
  // console.log(HierarchyProgress)

  let user_name = ""
  let meter_serial = ""
  if (HierarchyProgress && HierarchyProgress.user_name) {
    user_name = HierarchyProgress.user_name
    meter_serial = HierarchyProgress.meter_serial_number
  }

  const fetchData = async (params) => {
    return await useJwt
      .getMDMSUserBlockLoadData(params)
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
    if (fetchingData || retry) {
      let params = undefined

      if (endDateTime) {
        params = {
          project: HierarchyProgress.project_name,
          meter: HierarchyProgress.meter_serial_number,
          // meter: '212462',
          page: currentPage,
          start_date: startDateTime,
          end_date: endDateTime,
          page_size: 100
        }
      } else {
        params = {
          project: HierarchyProgress.project_name,
          meter: HierarchyProgress.meter_serial_number,
          // meter: '212462',
          page: currentPage,
          page_size: 100
        }
      }

      const [statusCode, response] = await fetchData(params)
      if (statusCode === 200) {
        try {
          const blockLoadResponse = []
          for (let i = 0; i < response?.data?.data?.result?.results?.length; i++) {
            const temp_data = response?.data?.data?.result?.results[i]["data"]
            // console.log(temp_data)

            temp_data["reporting_timestamp"] =
              response?.data?.data?.result?.results[i]["reporting_timestamp"]
            if (temp_data?.hasOwnProperty("temperature")) {
              blockLoadResponse.push(temp_data)
              // temp_data["temperature"] =
              //   response?.data?.data?.result?.results[i]["temperature"].toString()
            }
          }

          // console.log("block...", blockLoadResponse)

          // blockLoadResponse.map((item) => {
          //   const timeDifferenceInSeconds = moment(
          //     item.reporting_timestamp
          //   ).diff(item.blockload_datetime, 'seconds');
          //   const hours = Math.floor(timeDifferenceInSeconds / 3600);
          //   const minutes = Math.floor((timeDifferenceInSeconds % 3600) / 60);
          //   const seconds = timeDifferenceInSeconds % 60;

          //   item.response_time = `${
          //     hours ? hours.toString().concat(hours === 1 ? ' hr' : ' hrs') : ''
          //   } ${minutes ? minutes.toString().concat(' min') : ''} ${seconds
          //     .toString()
          //     .concat(' sec')}`;
          //   item.avg_current = Number(item.avg_current).toFixed(2);
          //   return item;
          // });

          setResponse(blockLoadResponse)
          setTotalCount(response.data.data.result.count)
          setFetchingData(false)
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
    }
  }, [fetchingData, retry])

  // console.log("API Response ....")
  // console.log(response)

  const tblColumn = () => {
    const column = []

    for (const i in response[0]) {
      const col_config = {}
      if (i !== "id" && i !== "meter_number") {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll("_", " ")
        col_config.serch = i
        col_config.sortable = true
        col_config.selector = (row) => row[i]
        col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)
        // col_config.selector = i
        // col_config.minWidth = get_length ? '200px' : '125px'
        // col_config.maxWidth = get_length ? '200px' : '125px'
        // col_config.maxWidth = i === 'feeder' ? '100px' : ''
        col_config.style = {
          minHeight: "40px",
          maxHeight: "40px"
        }
        // col_config.width = 'auto'

        if ((i === "blockload_datetime") | (i === "date_reporting_time")) {
          col_config.width = "200px"
        }

        col_config.cell = (row) => {
          // console.log("Block Load Row .....")
          // console.log(row)
          return (
            <div className='d-flex'>
              <span
                className='d-block font-weight-bold text-truncate'
                title={
                  row[i]
                    ? row[i] !== ""
                      ? row[i].toString().length > 20
                        ? row[i].toString()
                        : ""
                      : "-"
                    : "-"
                }
              >
                {row[i] && row[i] !== "" ? row[i].toString().substring(0, 20) : "-"}
                {row[i] && row[i] !== "" ? (row[i].toString().length > 20 ? "..." : "") : "-"}
              </span>
            </div>
          )
        }
        column.push(col_config)
      }
    }
    column.unshift({
      name: "Sr No.",
      width: "90px",
      sortable: false,
      cell: (row, i) => {
        return (
          <div className='d-flex justify-content-center'>
            {i + 1 + rowCount * (currentPage - 1)}
          </div>
        )
      }
    })
    return column
  }

  const onNextPageClicked = (number) => {
    setCurrentPage(number + 1)
    setFetchingData(true)
  }

  const reloadData = () => {
    setCurrentPage(1)
    setFetchingData(true)
  }

  const dateTimeFormat = (inputDate) => {
    return "".concat(
      inputDate.getFullYear(),
      "-",
      (inputDate.getMonth() + 1).toString().padStart(2, "0"),
      "-",
      inputDate.getDate().toString().padStart(2, "0"),
      " ",
      inputDate.getHours().toString().padStart(2, "0"),
      ":",
      inputDate.getMinutes().toString().padStart(2, "0"),
      ":",
      inputDate.getSeconds().toString().padStart(2, "0")
    )
  }

  const onDateRangeSelected = (dateRange) => {
    if (dateRange.length === 1) {
      setStartDateTime(dateTimeFormat(dateRange[0]))
      setEndDateTime(undefined)
    } else if (dateRange.length === 2) {
      setStartDateTime(dateTimeFormat(dateRange[0]))
      setEndDateTime(dateTimeFormat(dateRange[1]))
    }
  }

  const onDateRangeSelectedButtonPressed = () => {
    if (startDateTime && endDateTime) {
      setCurrentPage(1)
      setFetchingData(true)
    } else {
      toast.error(<Toast msg='Invalid DateTime Range' type='danger' />, {
        hideProgressBar: true
      })
    }
  }
  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }

  return (
    <Modal
      isOpen={props.isOpen}
      toggle={() => props.handleModalState(!props.isOpen)}
      scrollable
      className='modal_size'
    >
      <ModalHeader toggle={() => props.handleModalState(!props.isOpen)}>{props.title}</ModalHeader>
      <ModalBody>
        <Row className='justify-content-end mb-1'>
          <Col md='5'>
            <InputGroup>
              <Flatpickr
                placeholder='Select date ...'
                onChange={onDateRangeSelected}
                className='form-control'
                options={{ mode: "range", enableTime: true }}
              />
              <Button color='primary' outline onClick={onDateRangeSelectedButtonPressed}>
                Go
              </Button>
            </InputGroup>
          </Col>
        </Row>
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
            {fetchingData ? (
              <Loader hight='min-height-484' />
            ) : (
              <SimpleDataTablePaginated
                columns={tblColumn()}
                tblData={response}
                rowCount={rowCount}
                tableName={"Block Load Table".concat("(", meter_serial, ")")}
                refresh={reloadData}
                additional_columns={["meter_number"]}
                currentPage={currentPage}
                totalCount={totalCount}
                onNextPageClicked={onNextPageClicked}
              />
            )}
          </>
        )}
      </ModalBody>
    </Modal>
  )
}

export default BlobkLoadModal
