import React, { useEffect, useState } from "react"
import DataTabled from "../../../../../ui-elements/dataTableUpdated"
import { caseInsensitiveSort } from "@src/views/utils.js"
import { useDispatch } from "react-redux"
import { useLocation, useHistory } from "react-router-dom"
import Loader from "@src/views/project/misc/loader"
import useJwt from "@src/auth/jwt/useJwt"
import GasMeteringPaginatedTable from "../../../../../ui-elements/gasMeteringTable/gasMeteringPaginatedTable"
import { Card, Progress } from "reactstrap"
import CommonFilter from "../commonFilter"
import CardInfo from "@src/views/ui-elements/cards/actions/cardInfo"

const FotaModal = (props) => {
  const [totalCount, setTotalCount] = useState(0)
  const [page, setpage] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [response, setResponse] = useState([])
  const [fetchingData, setFetchingData] = useState(true)

  // Error Handling
  const [errorMessage, setErrorMessage] = useState("")
  const [hasError, setError] = useState(false)
  const [retry, setRetry] = useState(false)
  const [loader, setLoader] = useState(false)

  const [logout, setLogout] = useState(false)

  const [filterParams, setFilterParams] = useState({})

  const dispatch = useDispatch()
  const history = useHistory()
  const location = useLocation()
  const projectName = location.pathname.split("/")[2]

  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  // to fetch Sat config  data
  const fetchData = async (params) => {
    return await useJwt
      .getFOTAList(params)
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
      setLoader(true)
      let params = undefined
      if (filterParams) {
        params = {
          project: projectName === "ag&p-pratham" ? "agp-pratham" : projectName,
          ...filterParams,
          page: currentPage,
          page_size: 10
        }
      } else {
        params = {
          project: projectName === "ag&p-pratham" ? "agp-pratham" : projectName,
          page: currentPage,
          page_size: 10
        }
      }

      const [statusCode, response] = await fetchData(params)
      if (statusCode === 200) {
        try {
          const fotaResponse = []
          const responseData = response?.data?.data?.result?.results

          for (let i = 0; i < responseData.length; i++) {
            const item = responseData[i]
            if (item.hasOwnProperty("progress")) {
              item["progress"] = parseFloat(item["progress"]).toFixed(2)
            }
            fotaResponse.push(item)
          }

          setResponse(fotaResponse)
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
      setLoader(false)
    }
  }, [fetchingData, retry])

  const ProgressAnimated = (num) => {
    const number = num.replace(" ", "")
    const value = parseInt(num.replaceAll("%", " "))
    let colour = ""
    let animated = true
    if (value === 100) {
      colour = "progress-bar-success"
      animated = false
    } else {
      colour = "progress-bar-warning"
    }
    return (
      <>
        <Progress animated={animated} className={`${colour} w-50`} value={value} />
        <p className='mt-1 ml_5 '>{`(${number}) %`}</p>
      </>
    )
  }

  const tblColumn = () => {
    const column = []
    const custom_width = ["create_time"]
    for (const i in response[0]) {
      const col_config = {}
      if (i !== "id") {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll("_", " ")
        col_config.serch = i
        col_config.sortable = true
        col_config.reorder = true
        col_config.width = "150px"
        col_config.selector = (row) => row[i]
        col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)

        if (i === "progress") {
          col_config.width = "180px"
        }
        col_config.cell = (row) => {
          if (i === "progress") {
            return ProgressAnimated(row[i])
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
    return column
  }

  const reloadData = () => {
    setRetry(true)
    setCurrentPage("1")
  }

  // on next page
  const onNextPageClicked = (page) => {
    setCurrentPage(page + 1)
    setRetry(true)
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

  return (
    <>
      {/* <DataTabled
        rowCount={10}
        currentpage={page}
        ispagination
        selectedPage={setpage}
        columns={tblColumn()}
        tblData={response}
        tableName={"FOTA List"}
        // handleRowClick={onCellClick}
        pointerOnHover
        donotShowDownload={true}
      /> */}
      <Card className='p-2'>
        <CommonFilter onSubmitButtonClicked={onSubmitButtonClicked} />
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
                // extras={commandRetryConfiguration()}
                // filter={handleFilter}
              />
            </div>
          )
        )}
      </Card>
    </>
  )
}

export default FotaModal
