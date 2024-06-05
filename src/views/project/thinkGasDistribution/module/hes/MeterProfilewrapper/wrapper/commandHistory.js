import GasMeteringSimpleTable from "../../../../../../ui-elements/gasMeteringTable/gasmeteringsimpletable"
import React, { useState, useEffect } from "react"
import GasMeteringPaginatedTable from "../../../../../../ui-elements/gasMeteringTable/gasMeteringPaginatedTable"
import { useDispatch } from "react-redux"
import { useHistory, useLocation } from "react-router-dom"
import authLogout from "@src/auth/jwt/logoutlogic"
import useJwt from "@src/auth/jwt/useJwt"
import Loader from "@src/views/project/misc/loader"
import { CardBody, Card, Modal, ModalHeader, ModalBody } from "reactstrap"
// import MeterProfileTabs from './meterProfileTabs'
import { caseInsensitiveSort } from "@src/views/utils.js"
import CardInfo from "@src/views/ui-elements/cards/actions/cardInfo"

const CommandHistory = (props) => {
  // console.log('Row Selected ....')
  // console.log(props.rowSelected)

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
  const [retry, setRetry] = useState(true)
  const [loader, setLoader] = useState(false)

  const [rowSelected, setRowSelected] = useState(undefined)

  // ProjectName
  const projectName = location.pathname.split("/")[2]

  const [centeredModal, setCenteredModal] = useState(false)

  // To fetch the Meter Recharge History Data
  const fetchMeterCommandHistoryData = async (params) => {
    return await useJwt
      .getIndividualGasMeterCommandHistoryData(params)
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
    if (retry) {
      setLoader(true)
      const params = {
        page: currentPage,
        page_size: 10,
        project: projectName === "ag&p-pratham" ? "agp-pratham" : projectName,
        meter: props.rowSelected.meter_number
      }
      const [statusCode, response] = await fetchMeterCommandHistoryData(params)
      setLoader(false)
      if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else if (statusCode === 200 || statusCode === 204) {
        try {
          setResponse(response.data.data.result.results)
          setTotalCount(response.data.data.result.count)
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
  }, [retry])

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
        // col_config.width = "180px"
        col_config.selector = (row) => row[i]
        col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)

        // if (custom_width.includes(i)) {
        //   col_config.width = "190px"
        // }

        col_config.cell = (row) => {
          return (
            <div className='d-flex'>
              <span
                className='d-block font-weight-bold '
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
    setRetry(true)
    setCurrentPage("1")
  }

  // on next page
  const onNextPageClicked = (page) => {
    setCurrentPage(page + 1)
    setRetry(true)
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

  return (
    <>
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
                onRowClicked={onRowClicked}
                hidePointerOnHover={true}
              />
            </div>
          )
        )}
      </Card>

      {/* <Modal isOpen={centeredModal} toggle={() => setCenteredModal(!centeredModal)} className={`modal_size modal-dialog-centered`}>
        <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>Consumption Data</ModalHeader>
        <ModalBody>
          <MeterProfileTabs rowSelected={rowSelected} />
        </ModalBody>
      </Modal> */}
    </>
  )
}

export default CommandHistory
