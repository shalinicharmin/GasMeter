import React, { useState, useEffect } from "react"
import CommandExecutionDropdown from "../CommandExecutionWrapper/commandExecutionDropdown"
import GasMeteringPaginatedTable from "../../../../../ui-elements/gasMeteringTable/gasMeteringPaginatedTable"
import { useSelector, useDispatch } from "react-redux"
import { useLocation, useHistory } from "react-router-dom"
import authLogout from "../../../../../../auth/jwt/logoutlogic"
import useJwt from "@src/auth/jwt/useJwt"
import {
  CardBody,
  Card,
  UncontrolledTooltip,
  Modal,
  ModalHeader,
  ModalBody,
  Row,
  Col
} from "reactstrap"
import Loader from "@src/views/project/misc/loader"
import { caseInsensitiveSort } from "@src/views/utils.js"
import CardInfo from "@src/views/ui-elements/cards/actions/cardInfo"
import { Eye, Layers, X } from "react-feather"
import FotaModal from "./fotaModal"
import FilterForm from "./filterForm"
import SimpleTableForDLMSCommandResponse from "@src/views/ui-elements/dtTable/simpleTableForDLMSCommandResponse"

const CommandHistory = (props) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const location = useLocation()

  const currentSelectedModuleStatus = useSelector(
    (state) => state.CurrentSelectedModuleStatusReducer.responseData
  )

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  // TotalCount,response Local State
  const [totalCount, setTotalCount] = useState(0)
  const [response, setResponse] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasError, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [retry, setRetry] = useState(false)
  const [centeredModal, setCenteredModal] = useState(false)
  const [loader, setLoader] = useState(false)

  const [fotaModal, setFotaModal] = useState(false)
  const [filterModal, setFilterModal] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [filterParams, setfilterParams] = useState(undefined)

  const [histyData, setHistyData] = useState()
  const [selected_project, set_selected_project] = useState(undefined)
  // ProjectName
  const projectName = location.pathname.split("/")[2]

  if (currentSelectedModuleStatus.prev_project) {
    if (
      selected_project !== currentSelectedModuleStatus.project &&
      currentSelectedModuleStatus.prev_project !== currentSelectedModuleStatus.project
    ) {
      set_selected_project(currentSelectedModuleStatus.project)
      setCurrentPage(1)
      setFetchingData(true)
      setError(false)
    }
  }
  // To fetch the command history Data
  const fetchCommandHistoryData = async (params) => {
    return await useJwt
      .getGasMeterCommandHistoryData(params)
      .then((res) => {
        // console.log(res)
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
      .getCommandExecutionStatusResponse(params)
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
    if (retry || fetchingData) {
      setLoader(true)

      let params = undefined
      if (filterParams) {
        const meterList = filterParams?.meter?.map((list) => {
          return list.value
        })

        params = {
          page: currentPage,
          meter: meterList,
          command: filterParams?.command ? filterParams.command?.value : "",
          execution_status: filterParams?.execution_status
            ? filterParams.execution_status?.value
            : "",
          start_date: filterParams?.start_date,
          end_date: filterParams?.end_date,
          page_size: 10,
          project: projectName === "ag&p-pratham" ? "agp-pratham" : projectName
        }
      } else {
        params = {
          page: currentPage,
          page_size: 10,
          project: projectName === "ag&p-pratham" ? "agp-pratham" : projectName
        }
      }

      const [statusCode, response] = await fetchCommandHistoryData(params)
      setLoader(false)
      if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else if (statusCode === 200 || statusCode === 204) {
        try {
          const data = response?.data?.data?.result?.results
          const updatedResponse = data.map((values) => {
            if (Array.isArray(values.params)) {
              values.params = values.params.join(",")
            }
            return values
          })

          setResponse(updatedResponse)
          setTotalCount(response.data.data.result.count)
          setFilterModal(false)
          setFetchingData(false)
          setRetry(false)
          setError(false)
        } catch (error) {
          setRetry(false)
          setError(true)
          setErrorMessage("Something went wrong, please retry")
        }
      } else {
        setRetry(false)
        setError(true)
        setErrorMessage("Network Error, please retry")
      }
    }
  }, [retry, fetchingData])

  const tblColumn = () => {
    const column = []
    const custom_width = ["blockload_datetime"]

    for (const i in response[0]) {
      const col_config = {}
      if (i !== "id") {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll("_", " ")
        col_config.serch = i
        col_config.sortable = true
        col_config.reorder = true
        col_config.width = "180px"
        col_config.selector = (row) => row[i]
        col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)
        col_config.cell = (row) => {
          if (i === "params") {
            // console.log(row.command)
            return (
              <div
                className='font-weight-bold w-100'
                title={
                  row[i]
                    ? row[i] !== ""
                      ? row[i].toString().length > 10
                        ? row[i]
                        : ""
                      : "-"
                    : "-"
                }
              >
                {row[i] && row[i] !== "" ? row[i].toString().substring(0, 25) : "-"}
                {row[i] && row[i] !== "" ? (row[i].toString().length > 25 ? "..." : "") : "-"}
              </div>
            )
          }

          return <div className={`d-flex font-weight-bold w-100 `}>{row[i]}</div>
        }
        column.push(col_config)
      }
    }

    column.unshift({
      name: "Sr No",
      width: "90px",
      sortable: false,
      cell: (row, i) => {
        return <div className='d-flex justify-content-center'>{i + 1 + 10 * (currentPage - 1)}</div>
      }
    })

    const showData = async (row) => {
      const params = {
        id: row.id
      }
      const [statusCode, response] = await fetchHistoryData(params)
      setCenteredModal(true)
      if (statusCode === 200 || statusCode === 202) {
        const data = response?.data?.data?.result?.data
        setHistyData(data)
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      }
    }

    column.push({
      name: "Action",
      maxWidth: "100px",
      style: {
        minHeight: "40px",
        maxHeight: "40px"
      },
      cell: (row) => {
        if (row.execution_status === "IN_PROGRESS" || row.execution_status === "DISCARDED") {
          return <Eye size='20' className='ml-1 cursor-not-allowed  text-secondary' />
        } else {
          return (
            <Eye
              size='20'
              className='ml-1 cursor-pointer  text-primary'
              onClick={() => showData(row)}
            />
          )
        }
      }
    })

    return column
  }

  const commandRetryConfiguration = () => {
    return (
      <>
        <Layers
          className='ml-1 float-right mt_8'
          id='FotaProgress'
          size='15'
          onClick={() => setFotaModal(true)}
        />
        <UncontrolledTooltip placement='top' target='FotaProgress'>
          FOTA
        </UncontrolledTooltip>
      </>
    )
  }
  // to reload the data
  const reloadData = () => {
    setFetchingData(true)
    setCurrentPage("1")
  }

  // to reload command History while execute command
  const reloadCommandHistory = () => {
    setFetchingData(true)
    setCurrentPage("1")
  }

  // on next page
  const onNextPageClicked = (page) => {
    setCurrentPage(page + 1)
    setFetchingData(true)
  }

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }

  const handleFilter = () => {
    setFilterModal(!filterModal)
  }
  const CloseBtn = <X className='cursor-pointer mt_5' size={15} onClick={handleFilter} />

  const appliedFilterParams = (value) => {
    setfilterParams(value)
    setCurrentPage(1)
    setFetchingData(true)
  }

  const onResetButtonClicked = () => {
    setfilterParams({})
    setFilterModal(true)
  }

  const isArray = (a) => {
    return !!a && a.constructor === Array
  }

  const historyData = (historyData) => {
    const data = historyData
    // console.log(data)
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
            Object.keys(data).map((info, index) => (
              <Row key={index}>
                <Col sm='4' className='text-right border py-1'>
                  {`${info.charAt(0).toUpperCase()}${info.slice(1)}`.replaceAll("_", " ")}
                </Col>
                <Col sm='8' className='border py-1'>
                  <h5 className='m-0'>
                    {Array.isArray(data[info]) ? data[info].join(" , ") : data[info]}
                  </h5>
                </Col>
              </Row>
            ))
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
                    "response"
                    // eventsRelated(info)
                    //   ? ` ${historyData.cmd_detail} {${eventsRelated(info)}}`
                    //   : `${historyData.cmd_detail}`
                  }
                  rowCount={10}
                  // commandName={result.cmdName}
                />
              )
            })
          ) : (
            <h3 className='text-center'>No data found</h3>
          )}
        </Col>
      )
    ) : (
      <h3 className='text-center'>No data found</h3>
    )
  }

  const fullInfo = () => {
    if (histyData && histyData.hasOwnProperty("data") && Array.isArray(histyData.data)) {
    }
    return <Row>{histyData ? historyData(histyData) : ""}</Row>
  }
  return (
    <>
      {/* Command Execution Component */}
      <CommandExecutionDropdown reloadCommandHistory={reloadCommandHistory} />

      <Card>
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
                rowCount={10}
                tableName={"Command History"}
                refresh={reloadData}
                currentPage={currentPage}
                totalCount={totalCount}
                onNextPageClicked={onNextPageClicked}
                // onRowClicked={onRowClicked}
                hidePointerOnHover={true}
                extras={commandRetryConfiguration()}
                filter={handleFilter}
              />
            </div>
          )
        )}
      </Card>

      {/* Command History data modal */}
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

      {/* FILTER MODAL  */}
      <Modal
        isOpen={filterModal}
        toggle={handleFilter}
        className='sidebar-md'
        modalClassName='modal-slide-in-left'
        contentClassName='pt-0'
      >
        <ModalHeader className='mb-3' toggle={handleFilter} close={CloseBtn} tag='div'>
          <h4 className='modal-title'>Command history</h4>
        </ModalHeader>
        <ModalBody className='flex-grow-1'>
          <FilterForm
            appliedFilterParams={appliedFilterParams}
            filterParams={filterParams}
            setfilterParams={setfilterParams}
            onResetButtonClicked={onResetButtonClicked}
          />
        </ModalBody>
      </Modal>

      {/* FOTA MODAL */}
      <Modal
        isOpen={fotaModal}
        toggle={() => setFotaModal(!fotaModal)}
        className={`modal-xl modal-dialog-centered`}
      >
        <ModalHeader toggle={() => setFotaModal(!fotaModal)}>FOTA</ModalHeader>
        <ModalBody>
          <FotaModal />
        </ModalBody>
      </Modal>
    </>
  )
}

export default CommandHistory
