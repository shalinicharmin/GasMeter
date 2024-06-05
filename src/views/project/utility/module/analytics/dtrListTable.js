import SimpleDataTable from "@src/views/ui-elements/dtTable/simpleTable"

import { useState, useEffect } from "react"
// ** Styles
import "@styles/react/libs/charts/apex-charts.scss"
// import AssetAnalyticsReport from './assetAnalyticsReport'
// import DtrReportTab from './dtrReportTab'
import useJwt from "@src/auth/jwt/useJwt"
import jwt_decode from "jwt-decode"
import Loader from "@src/views/project/misc/loader"
import CardInfo from "@src/views/ui-elements/cards/actions/cardInfo"
// import { useLocation } from 'react-router-dom'
import authLogout from "../../../../../auth/jwt/logoutlogic"
import { useDispatch } from "react-redux"
import { useLocation, useHistory } from "react-router-dom"
import { caseInsensitiveSort } from "@src/views/utils.js"

const DtrAnalytic = (props) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const location = useLocation()

  const [logout, setLogout] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [hasError, setError] = useState(false)
  const [retry, setRetry] = useState(true)
  const [resp, setResp] = useState("")

  const [response, setResponse] = useState([])

  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const retryAgain = () => {
    setError(false)
    setRetry(true)
    // setLoadCommandHistory(true)
  }

  const fetchDTRTableData = async (params) => {
    return await useJwt
      .getAnalyticsReportDTRPostRequest(params)
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
    if (retry && props.dtr_list.length > 0) {
      const site_list = []
      for (let i = 0; i < props.dtr_list.length; i++) {
        // console.log(props.dtr_list[i]['dtr_id'])
        site_list.push(props.dtr_list[i]["dtr_id"])
      }

      let params = {}
      params = {
        reportId: 3000,
        siteId: site_list
      }

      const [statusCode, response] = await fetchDTRTableData(params)

      // setRetry(false)

      if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else if (statusCode === 200) {
        // Set Total Row Count
        // setTotalCount(response.data.data.result.data.length)
        // Set Response Data
        setResponse(response.data.data.result.data)
        setRetry(false)
        setError(false)
      } else {
        setRetry(false)
        setError(true)
        setErrorMessage("Network Error, please retry")
      }
    }
  }, [retry, props.dtr_list])

  const tblColumn = () => {
    const column = []

    if (response.length > 0) {
      for (const i in response[0]) {
        const col_config = {}
        if (i !== "id" && i !== "pss_id" && i !== "feeder_id" && i !== "site_id") {
          col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll("_", " ")
          col_config.serch = i
          col_config.sortable = true
          col_config.selector = (row) => row[i]
          col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)
          // col_config.style = {
          //   width: '400px'
          // }
          // col_config.width = "200px"
          col_config.cell = (row) => {
            return (
              <div className='d-flex'>
                <span
                  className='d-block font-weight-bold cursor-pointer'
                  onClick={() => props.openDTRReport(4, row)}
                >
                  {row[i]}
                </span>
              </div>
            )
          }
          column.push(col_config)
        }
      }
    }

    return column
  }

  if (hasError) {
    return (
      <div>
        <CardInfo
          props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }}
        />
      </div>
    )
  }

  if (!hasError) {
    return !retry ? (
      <SimpleDataTable columns={tblColumn()} tblData={response} tableName={props.tableName} />
    ) : (
      <Loader hight='min-height-233' />
    )
  }
}

export default DtrAnalytic
