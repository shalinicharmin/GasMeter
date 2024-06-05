// import React from 'react'
// import CommonSelector from '../Selector/commonSelector'
import RequestReportCommonSelector from '../Selector/requestReportCommonSelector'
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
import { Badge, Tooltip, UncontrolledTooltip } from 'reactstrap'
import { formattedDate, formattedDateTime, getDefaultDateRange } from '../../../../../../../utility/Utils'

import authLogout from '../../../../../../../auth/jwt/logoutlogic'
import { useDispatch } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'
import { caseInsensitiveSort } from '@src/views/utils.js'
import { Download, DownloadCloud } from 'react-feather'

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

  const [filterParams, setFilterParams] = useState({})
  const [ReportRequestFilterParams, setReportRequestFilterParams] = useState({})

  const onSearchButtonClicked = val => {
    // console.log(val)
    const prms = {}
    for (const key of Object.keys(val)) {
      if (val[key]) {
        prms[key] = val[key]
      }
    }
    setFilterParams(val)
    setCurrentPage(1)
    setRetry(true)
  }

  const onRequestReportButtonClicked = val => {
    // console.log('Request Report Button Clicked ....')
    // console.log(val)

    if (val.startDate) {
      setReportRequestFilterParams(val)
      setRetryReportRequest(true)
    } else {
      toast.error(<Toast msg={'Select startDate and EndDate'} type='danger' />, { hideProgressBar: true })
    }
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

      // const params = { reportId: 2001, ...ReportRequestFilterParams }
      // if (ReportRequestFilterParams) {
      //   params = {
      //     ...ReportRequestFilterParams
      //   }
      // }

      let params = {}
      if (ReportRequestFilterParams.hasOwnProperty('siteId') && ReportRequestFilterParams.siteId) {
        params = { reportId: 2001, ...ReportRequestFilterParams }
      } else {
        const site_list = []
        for (let i = 0; i < props.dtr_list.length; i++) {
          // console.log(props.dtr_list[i]['dtr_id'])
          site_list.push(props.dtr_list[i]['dtr_id'])
        }

        params = {
          reportId: 2001,
          ...ReportRequestFilterParams,
          siteId: site_list
        }
        // console.log(params)
      }
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
      // const params = { reportId: 2001, ...filterParams }
      let params = {}
      if (filterParams) {
        params = {
          reportId: 2001,
          ...filterParams
        }
      } else {
        params = {
          reportId: 2001
        }
      }
      const [statusCode, response] = await fetchRechargeReportRequestHistory(params)
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
        if (i !== '_id' && i !== '__v' && i !== 'username' && i !== 'fileLink' && i !== 'status') {
          col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
          col_config.serch = i
          // col_config.selector = i
          col_config.sortable = true
          col_config.reorder = true
          col_config.wrap = true
          col_config.selector = row => row[i]
          col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)

          col_config.width = '180px'

          col_config.cell = row => {
            return (
              <div className='d-flex'>
                <span
                  className='d-block font-weight-bold '
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
                <Badge pill color='light-success' className=''>
                  {row.status}
                </Badge>
              </>
            )
          } else if (row.status === 'processing') {
            return (
              <>
                <Badge pill color='light-warning' className=''>
                  {row.status}
                </Badge>
              </>
            )
          } else if (row.status === 'failed') {
            return (
              <>
                <Badge pill color='light-danger' className=''>
                  {row.status}
                </Badge>
              </>
            )
          }
        }
      })
      column.push({
        name: 'Download ',
        width: '120px',
        cell: row => {
          if (row.status === 'success') {
            return (
              <>
                <a href={row.fileLink}>
                  {/* <Badge pill color='light-success' className='' id='success'>
                    {row.status}
                  </Badge> */}
                  <Download size={20} className=' primary mx-2 ' id='success' />
                </a>
                <UncontrolledTooltip
                  placement='top'
                  target='success'
                  modifiers={{ preventOverflow: { boundariesElement: 'window' } }}
                  autohide={false}
                  delay={{ show: 200, hide: 5 }}>
                  File is ready to Download
                </UncontrolledTooltip>
              </>
            )
          } else if (row.status === 'processing') {
            return (
              <>
                <Download size={20} className='mx-2 text-secondary not_allowed ' id='processing' />
                <UncontrolledTooltip
                  placement='top'
                  target='processing'
                  modifiers={{ preventOverflow: { boundariesElement: 'window' } }}
                  autohide={false}
                  delay={{ show: 200, hide: 5 }}>
                  In {row.status} Can't Download
                </UncontrolledTooltip>
              </>
            )
          } else if (row.status === 'failed') {
            return (
              <>
                <Download size={20} className='mx-2 text-secondary not_allowed ' id='failed' />
                <UncontrolledTooltip
                  placement='top'
                  target='failed'
                  modifiers={{ preventOverflow: { boundariesElement: 'window' } }}
                  autohide={false}
                  delay={{ show: 200, hide: 5 }}>
                  {row.status} Can't Download
                </UncontrolledTooltip>
              </>
            )
          }
        }
      })
    }

    return column
  }

  if (hasError) {
    return (
      <div>
        <RequestReportCommonSelector
          dtr_list={props.dtr_list}
          pss_list={props.pss_list}
          feeder_list={props.feeder_list}
          onSearchButtonClicked={onSearchButtonClicked}
          onRequestReportButtonClicked={onRequestReportButtonClicked}
        />

        <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
      </div>
    )
  }

  return (
    <div>
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
          donotShowDownload={true}
        />
      )}

      {retry && <Loader hight='min-height-233' />}
    </div>
  )
}

export default RechargeReportHistory
