import React, { useState, useEffect } from "react"
import GasMeteringPaginatedTable from "../../../../../ui-elements/gasMeteringTable/gasMeteringPaginatedTable"
import { useDispatch, useSelector } from "react-redux"
import { useHistory, useLocation } from "react-router-dom"
import authLogout from "@src/auth/jwt/logoutlogic"
import useJwt from "@src/auth/jwt/useJwt"
import Loader from "@src/views/project/misc/loader"
import { CardBody, Card, Modal, ModalHeader, ModalBody } from "reactstrap"
import MeterProfileTabs from "./meterProfileTabs"
import { caseInsensitiveSort } from "@src/views/utils.js"
import CardInfo from "@src/views/ui-elements/cards/actions/cardInfo"
import CommonFilter from "../commonFilter"
import moment from "moment"

const MeterProfile = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const location = useLocation()

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
  const [loader, setLoader] = useState(false)

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

  // ProjectName
  const projectName = location.pathname.split("/")[2]

  const [centeredModal, setCenteredModal] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [selected_project, set_selected_project] = useState(undefined)

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

  // To fetch the command history Data
  const fetchMeterProfileData = async (params) => {
    return await useJwt
      .getGasMeterMeterProfileData(params)
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
      const [statusCode, response] = await fetchMeterProfileData(params)
      setLoader(false)
      if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else if (statusCode === 200 || statusCode === 204) {
        try {
          const resp = response.data.data.result.results
          // const updatedResults = response.data.data.result.results.map((result) => {
          //   // Check if the old key exists in the object
          //   if ("current_tariff_gas_price_INR_MMBtu" in result) {
          //     // Retrieve the value associated with the old key
          //     const value = result["current_tariff_gas_price_INR_MMBtu"]
          //     const updatedResult = {
          //       ...result,
          //       "current_tariff_gas_price_INR/MMBtu": value
          //     }
          //     // Delete the old key from the new object
          //     delete updatedResult["current_tariff_gas_price_INR_MMBtu"]
          //     // Return the updated object
          //     return updatedResult
          //   }
          //   // If the old key doesn't exist, return the original object
          //   return result
          // })

          setResponse(resp)
          setTotalCount(response.data.data.result.count)
          setPageRefresh(false)
          setRetry(false)
          setFetchingData(false)
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
  }, [fetchingData, retry])

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

        if (i === "credit_zone") {
          col_config.width = "200px"
        }
        col_config.cell = (row) => {
          return (
            <div className='d-flex' data-tag='allowRowEvents'>
              <span
                className='d-block font-weight-bold '
                data-tag='allowRowEvents'
                title={
                  row[i]
                    ? row[i] !== ""
                      ? row[i].toString().length > 20
                        ? row[i]
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
      name: "Sr No",
      width: "90px",
      sortable: false,
      cell: (row, i) => {
        return <div className='d-flex justify-content-center'>{i + 1 + 10 * (currentPage - 1)}</div>
      }
    })
    return column
  }

  // to reload the data
  const reloadData = () => {
    setFetchingData(true)
    setCurrentPage("1")
    setPageRefresh(true)
  }

  // on next page
  const onNextPageClicked = (page) => {
    setCurrentPage(page + 1)
    setFetchingData(true)
  }

  const onRowClicked = (rowSelected) => {
    // console.log('Row Clicked Data .....')
    // console.log(rowSelected)
    // console.log(index)
    // console.log(i)
    setRowSelected(rowSelected)
    setCenteredModal(!centeredModal)
  }

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }
  const onSubmitButtonClicked = (filterParams) => {
    setFilterParams(filterParams)
    setCurrentPage(1)
    setFetchingData(true)
  }

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
                rowCount={10}
                tableName={"Meter Profile"}
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
          <MeterProfileTabs rowSelected={rowSelected} />
        </ModalBody>
      </Modal>
    </>
  )
}

export default MeterProfile
