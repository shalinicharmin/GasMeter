import React, { useState, useEffect } from "react"
import SlaFilter from "./slaFilter"
import { Card, CardBody } from "reactstrap"
import DataTabled from "../../../../ui-elements/dataTableUpdated"
import Loader from "@src/views/project/misc/loader"
import { caseInsensitiveSort } from "@src/views/utils.js"
import CardInfo from "@src/views/ui-elements/cards/actions/cardInfo"
import useJwt from "@src/auth/jwt/useJwt"
import moment from "moment"
import authLogout from "../../../../../auth/jwt/logoutlogic"
import { useDispatch } from "react-redux"
import { useHistory } from "react-router-dom"

const RCDCSLAReport = () => {
  const defaultStartDate = moment().subtract(1, "days").startOf("day").format("YYYY-MM-DD") // Yesterday, start of day
  const defaultEndDate = moment().startOf("day").format("YYYY-MM-DD") // Today, start of day
  // Error Handling
  const [page, setpage] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")
  const [hasError, setError] = useState(false)
  const [retry, setRetry] = useState(false)
  const [loader, setLoader] = useState(false)
  const [response, setResponse] = useState([])
  const [fetchingData, setFetchingData] = useState(true)
  const [appliedParams, setAppliedParams] = useState({
    startDate: defaultStartDate,
    endDate: defaultEndDate
  })

  // Logout User
  const [logout, setLogout] = useState(false)
  const dispatch = useDispatch()
  const history = useHistory()
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  // Fetch Blockload SLAReports data
  //   const fetchData = async (params) => {
  //     return await useJwt
  //       .getDailyLoadSlaReports(params)
  //       .then((res) => {
  //         // console.log(res)
  //         const status = res.status
  //         return [status, res]
  //       })
  //       .catch((err) => {
  //         if (err.response) {
  //           const status = err.response.status
  //           return [status, err]
  //         } else {
  //           return [0, err]
  //         }
  //       })
  //   }

  //   useEffect(async () => {
  //     if (fetchingData || retry) {
  //       setLoader(true)
  //       const params = { ...appliedParams }

  //       const [statusCode, response] = await fetchData(params)
  //       if (statusCode === 200) {
  //         try {
  //           const res = response.data
  //           const modifiedRes = res.map(({ slaAcheived, ...rest }) => ({
  //             ...rest,
  //             "slaAchieved(%)": slaAcheived
  //           }))
  //           setResponse("")
  //           setFetchingData(false)
  //           setRetry(false)
  //         } catch (error) {
  //           setRetry(false)
  //           setError(true)
  //           setErrorMessage("Something went wrong, please retry")
  //         }
  //       } else if (statusCode === 401 || statusCode === 403) {
  //         setLogout(true)
  //       } else {
  //         setRetry(false)
  //         setError(true)
  //         setErrorMessage("Network Error, please retry")
  //       }
  //       setLoader(false)
  //     }
  //   }, [fetchingData, retry])

  const tblColumn = () => {
    const column = []
    const custom_width = ["create_time"]
    for (const i in response[0]) {
      const col_config = {}
      if (i !== "id" && i !== "site_id" && i !== "year") {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll("_", " ")
        col_config.serch = i
        col_config.sortable = true
        col_config.reorder = true
        // col_config.width = '150px'
        col_config.selector = (row) => row[i]
        col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)

        if (i === "siteId") {
          col_config.width = "240px"
        } else {
          col_config.width = "240px"
        }
        col_config.cell = (row) => {
          return (
            <div className={`d-flex font-weight-bold w-100`}>
              <span
                className=''
                // data-tag='allowRowEvents'
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
                    ? row[i].toString().substring(0, 25)
                    : "-"
                  : "-"}
                {row[i] || row[i] === 0
                  ? (row[i] || row[i] === 0) && row[i] !== ""
                    ? row[i].toString().length > 25
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
      name: "Sr No.",
      width: "90px",
      cell: (row, i) => {
        return <div className='d-flex justify-content-center'>{page * 10 + 1 + i}</div>
      }
    })
    return column
  }

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }

  const refresh = () => {
    setpage(0)
    setError(false)
    setRetry(true)
  }

  const filterParams = (val) => {
    // console.log(val, "from daily load .....")
    setAppliedParams(val)
    setFetchingData(true)
  }
  return (
    <>
      <Card>
        <CardBody>
          <SlaFilter filterParams={filterParams} />

          {loader ? (
            <Loader hight='min-height-330' />
          ) : hasError ? (
            <CardInfo
              props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }}
            />
          ) : (
            !retry && (
              <div className='table-wrapper'>
                <DataTabled
                  rowCount={10}
                  currentpage={page}
                  ispagination
                  selectedPage={setpage}
                  columns={tblColumn()}
                  tblData={response}
                  tableName={"RC/DC SLA Report"}
                  // handleRowClick={onCellClick}
                  // pointerOnHover
                  refresh={refresh}
                />
              </div>
            )
          )}
        </CardBody>
      </Card>
    </>
  )
}

export default RCDCSLAReport
