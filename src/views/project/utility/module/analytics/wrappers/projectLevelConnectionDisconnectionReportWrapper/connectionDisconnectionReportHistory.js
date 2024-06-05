// import React from 'react'
// import CommonSelector from '../Selector/commonSelector'
// import RequestReportCommonSelector from '../requestReportCommonSelector'
import RequestReportCommonSelector from '../Selector/requestReportCommonSelector'
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
import { Download } from 'react-feather'
// import { getDefaultDateRange } from '../../../../../../../utility/Utils'

const ConnectionDisconnectinReportHistory = props => {
  const location = useLocation()
  const dispatch = useDispatch()
  const history = useHistory()

  const report_types = [
    { label: 'Consumer Current State Report', value: '2003' },
    { label: 'Connection Disconnection Counts Report ', value: '2004' },
    { label: 'Negative Balance Aging Report - 7 days', value: '2006', numberOfDays: '7' },
    { label: 'Disconnected Consumers Report Report ', value: '2005' },
    { label: 'Negative Balance Aging Report - 15 days', value: '2006', numberOfDays: '15' },
    { label: 'Negative Balance Aging Report - 30 days', value: '2006', numberOfDays: '30' }
  ]
  const default_report_type = { label: 'Consumer Current State Report', value: '2003' }

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

  const [filterParams, setFilterParams] = useState({ reportId: default_report_type.value })
  const [ReportRequestFilterParams, setReportRequestFilterParams] = useState({ reportId: default_report_type.value })

  const onSearchButtonClicked = val => {
    setFilterParams(val)
    setCurrentPage(1)
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

      // const params = { ...ReportRequestFilterParams }

      let params = {}
      if (ReportRequestFilterParams.hasOwnProperty('siteId') && ReportRequestFilterParams.siteId) {
        params = { ...ReportRequestFilterParams }
      } else {
        const site_list = []
        for (let i = 0; i < props.dtr_list.length; i++) {
          // console.log(props.dtr_list[i]['dtr_id'])
          site_list.push(props.dtr_list[i]['dtr_id'])
        }
        params = {
          ...ReportRequestFilterParams,
          siteId: site_list
        }
      }

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
        toast.success(<Toast msg={'report request accepted.'} type='success' />, { hideProgressBar: true })
      } else {
        toast.error(<Toast msg={'Something went wrong please retry'} type='danger' />, { hideProgressBar: true })
      }
    }
  }, [retryReportRequest])

  useEffect(async () => {
    if (retry) {
      const params = { ...filterParams }
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
        if (i !== '_id' && i !== '__v' && i !== 'username' && i !== 'fileLink' && i !== 'status') {
          col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
          col_config.serch = i
          // col_config.selector = i
          col_config.selector = row => row[i]
          col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)
          col_config.sortable = true
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
                <Download size={20} className='mx-2 secondary not_allowed ' id='processing' />
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
                <Download size={20} className='mx-2 secondary  not_allowed ' id='failed' />
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
          report_types={report_types}
          default_report_type={default_report_type}
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
        report_types={report_types}
        default_report_type={default_report_type}
      />

      {!retry && (
        <SimpleDataTable
          columns={tblColumn()}
          tblData={response}
          rowCount={10}
          tableName={'Connection Disconnection Report Request History'}
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

export default ConnectionDisconnectinReportHistory
