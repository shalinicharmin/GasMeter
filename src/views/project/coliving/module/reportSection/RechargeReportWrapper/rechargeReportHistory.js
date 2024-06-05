// import React from 'react'
// import CommonSelector from '../Selector/commonSelector'
import RequestReportCommonSelector from '@src/views/project/coliving/module/reportSection/selection/requestReportCommonSelector.js'
// import RequestReportCommonSelector from '../requestReportCommonSelector'
// import SimpleDataTableMDAS from '@src/views/ui-elements/dtTable/simpleTableMDASUpdated'
import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable'
import React, { useEffect, useState } from 'react'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
import useJwt from '@src/auth/jwt/useJwt'
import Loader from '@src/views/project/misc/loader'
// import { useLocation } from 'react-router-dom'

import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import { Badge, Card, CardBody, Tooltip, UncontrolledTooltip } from 'reactstrap'
import { formattedDate, formattedDateTime, getDefaultDateRange } from '@src/utility/Utils.js'

import authLogout from '@src/auth/jwt/logoutlogic.js'
import { useDispatch } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'

import { caseInsensitiveSort } from '@src/views/utils.js'

const RechargeReportHistory = props => {
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

  const [hasError, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [retry, setRetry] = useState(true)

  const [response, setResponse] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const [retryReportRequest, setRetryReportRequest] = useState(false)

  // const [loadCommandHistory, setLoadCommandHistory] = useState(true)

  const [filterParams, setFilterParams] = useState(getDefaultDateRange())
  const [ReportRequestFilterParams, setReportRequestFilterParams] = useState(getDefaultDateRange())

  const onSearchButtonClicked = val => {
    setFilterParams(val)
    setRetry(true)
  }

  const onRequestReportButtonClicked = val => {
    // console.log('Request Report Button Clicked ....')

    setReportRequestFilterParams(val)
    setRetryReportRequest(true)
  }

  const retryAgain = () => {
    setError(false)
    setRetry(true)
    // setLoadCommandHistory(true)
  }

  const fetchRechargeReportRequestHistory = async params => {
    return await useJwt
      .getAnalyticsRequestReportHistory(params)
      .then(res => {
        const status = res.status
        return [status, res]
      })
      .catch(err => {
        if (err.response) {
          const status = err.response.status
          return [status, err]
        } else {
          return [0, err]
        }
      })
  }

  const requestRechargeReport = async params => {
    return await useJwt
      .postAnalyticsRequestReport(params)
      .then(res => {
        const status = res.status
        return [status, res]
      })
      .catch(err => {
        if (err.response) {
          const status = err.response.status
          return [status, err]
        } else {
          return [0, err]
        }
      })
  }

  useEffect(async () => {
    if (retryReportRequest) {
      // console.log('Report Request API Called ....')
      // console.log(ReportRequestFilterParams)

      const params = { reportId: 2001, ...ReportRequestFilterParams }
      // if (ReportRequestFilterParams) {
      //   params = {
      //     ...ReportRequestFilterParams
      //   }
      // }

      const [statusCode, response] = await requestRechargeReport(params)

      setRetryReportRequest(false)

      if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else if (statusCode === 202) {
        setRetry(true)
        toast.success(<Toast msg={'Recharge report request accepted.'} type='success' />, { hideProgressBar: true })
      } else {
        toast.error(<Toast msg={'Something went wrong please retry'} type='danger' />, { hideProgressBar: true })
      }
    }
  }, [retryReportRequest])

  useEffect(async () => {
    if (retry) {
      const params = { reportId: 2001, ...filterParams }
      // if (filterParams) {
      //   params = {
      //     ...filterParams
      //   }
      // }

      const [statusCode, response] = await fetchRechargeReportRequestHistory(params)

      // setLoadCommandHistory(false)
      setRetry(false)

      // console.log('Status Code For Response ....')
      // console.log(statusCode)
      // console.log('Response .....')
      // console.log(response.data.data.result)

      if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else if (statusCode === 200) {
        // Set Total Row Count
        setTotalCount(response.data.data.result.totalRowsCount)
        // Set Response Data
        setResponse(response.data.data.result)
      } else {
        setRetry(false)
        setError(true)
        setErrorMessage('Network Error, please retry')
      }
    }
  }, [retry])

  // const onNextPageClicked = page => {
  //   setCurrentPage(page + 1)
  //   setRetry(true)
  //   // setLoadCommandHistory(true)
  // }

  const refresh = () => {
    setCurrentPage(1)
    // setLoadCommandHistory(true)
    setRetry(true)
  }

  const tblColumn = () => {
    const column = []

    if (response.length > 0) {
      // console.log('REsponse ....')
      // console.log(response)

      for (const i in response[0]) {
        const col_config = {}
        if (i !== '_id' && i !== '__v' && i !== 'username' && i !== 'fileLink' && i !== 'status' && i !== 'createdAt' && i !== 'updatedAt') {
          col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
          col_config.serch = i
          // col_config.selector = i
          col_config.selector = row => row[i]
          col_config.sortable = true
          col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)
          col_config.reorder = true
          col_config.wrap = true
          col_config.width = '180px'
          // col_config.style = {
          //   maxWidth:'200000px'
          // }
          // col_config.style = {
          //   minHeight: '40px',
          //   maxHeight: '60px'
          // }

          col_config.cell = row => {
            // console.log('Printing Row ....')
            // console.log(row)

            return (
              <div className='d-flex'>
                <span
                  className='d-block font-weight-bold text-truncate'
                  title={row[i] ? (row[i] !== '' ? (row[i].toString().length > 20 ? row[i] : '') : '-') : '-'}>
                  {row[i] && row[i] !== '' ? row[i].toString().substring(0, 20) : '-'}
                  {row[i] && row[i] !== '' ? (row[i].toString().length > 20 ? '...' : '') : '-'}
                </span>
              </div>
            )
          }
          column.push(col_config)
        }
      }
      column.push({
        name: 'Status',
        width: '120px',
        cell: row => {
          if (row.status === 'success') {
            return (
              <>
                <a href={row.fileLink}>
                  <Badge pill color='light-success' className='' id='success'>
                    {row.status}
                  </Badge>
                </a>
                <UncontrolledTooltip placement='top' target='success'>
                  File is ready to Download
                </UncontrolledTooltip>
              </>
            )
          } else if (row.status === 'processing') {
            return (
              <>
                <Badge pill color='light-warning' className='' id='processing'>
                  {row.status}
                </Badge>
                <UncontrolledTooltip placement='top' target='processing'>
                  In {row.status} Can't Download
                </UncontrolledTooltip>
              </>
            )
          } else if (row.status === 'failed') {
            return (
              <>
                <Badge pill color='light-warning' className='' id='failed'>
                  {row.status}
                </Badge>
                <UncontrolledTooltip placement='top' target='failed'>
                  {row.status} Can't Download
                </UncontrolledTooltip>
              </>
            )
          }
        }
      })
      column.push({
        name: 'CreatedAt',
        width: '220px',
        cell: row => {
          return <span style={{ fontWeight: '500' }}>{formattedDateTime(row.createdAt)}</span>
        }
      })
      column.push({
        name: 'UpdatedAt',
        width: '220px',
        cell: row => {
          return <span style={{ fontWeight: '500' }}>{formattedDateTime(row.updatedAt)}</span>
        }
      })
    }

    return column
  }

  return (
    <div>
      <Card>
        <CardBody className='p-0'>
          {hasError ? (
            <div>
              <RequestReportCommonSelector
                dtr_list={props.dtr_list}
                pss_list={props.pss_list}
                feeder_list={props.feeder_list}
                onSearchButtonClicked={onSearchButtonClicked}
                onRequestReportButtonClicked={onRequestReportButtonClicked}
              />
              <hr />
              <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
            </div>
          ) : (
            <>
              <RequestReportCommonSelector
                dtr_list={props.dtr_list}
                pss_list={props.pss_list}
                feeder_list={props.feeder_list}
                onSearchButtonClicked={onSearchButtonClicked}
                onRequestReportButtonClicked={onRequestReportButtonClicked}
              />

              {!retry && (
                <SimpleDataTable
                  columns={tblColumn()}
                  tblData={response}
                  rowCount={10}
                  tableName={'Recharge Report Request History'}
                  refresh={refresh}
                  currentPage={currentPage}
                  totalCount={totalCount}
                />
              )}
            </>
          )}
          {retry && <Loader hight='min-height-233' />}
        </CardBody>
      </Card>
    </div>
  )
}

export default RechargeReportHistory
