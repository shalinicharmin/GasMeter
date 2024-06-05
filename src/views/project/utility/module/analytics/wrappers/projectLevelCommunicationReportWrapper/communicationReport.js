// import React from 'react'
import CommonSelector from '../Selector/commonSelector'
import SimpleDataTableMDAS from '@src/views/ui-elements/dtTable/simpleTableMDASUpdated'
import React, { useEffect, useState } from 'react'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
import useJwt from '@src/auth/jwt/useJwt'
import Loader from '@src/views/project/misc/loader'
// import { useLocation } from 'react-router-dom'
import { getDefaultDateRange } from '../../../../../../../utility/Utils'
import authLogout from '../../../../../../../auth/jwt/logoutlogic'
import { useDispatch } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'
import { caseInsensitiveSort } from '@src/views/utils.js'

const CommunicationReport = props => {
  const location = useLocation()
  const dispatch = useDispatch()
  const history = useHistory()

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

  // const [loadCommandHistory, setLoadCommandHistory] = useState(true)

  const report_types = [
    { label: 'Meter not communicating for last 7 days', value: '2007', numberOfDays: '7' },
    { label: 'Meter not communicating for last 15 days', value: '2007', numberOfDays: '15' },
    { label: 'Meter not communicating for last 30 days', value: '2007', numberOfDays: '30' },
    { label: 'Meter never communicated', value: '2007', numberOfDays: '-1' }
  ]
  const default_report_type = { label: 'Meter not communicating for last 7 days', value: '2007', numberOfDays: '7' }

  const [filterParams, setFilterParams] = useState({ intervalDays: default_report_type.numberOfDays })

  const onSearchButtonClicked = val => {
    // console.log('Search Button Clicked ....')
    // console.log(val)
    setFilterParams(val)
    setCurrentPage(1)
    // setLoadCommandHistory(true)
    setRetry(true)
  }

  const retryAgain = () => {
    setError(false)
    setRetry(true)
    // setLoadCommandHistory(true)
  }

  const fetchRechargeReportAnalytics = async params => {
    return await useJwt
      .getAnalyticsReportPostRequest(params)
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
    if (retry) {
      let params = {}
      // params = {
      //   vertical: location.pathname.split('/')[1],
      //   project: location.pathname.split('/')[2],
      //   module: location.pathname.split('/')[3],
      //   page: currentPage,
      //   rows: 10,
      //   reportId: default_report_type.value,
      //   ...filterParams
      // }

      if (filterParams.hasOwnProperty('siteId') && filterParams.siteId) {
        params = {
          vertical: location.pathname.split('/')[1],
          project: location.pathname.split('/')[2],
          module: location.pathname.split('/')[3],
          page: currentPage,
          rows: 10,
          reportId: default_report_type.value,
          ...filterParams
        }
      } else {
        // console.log('Filter Params has no property DTR List ....')

        const site_list = []
        for (let i = 0; i < props.dtr_list.length; i++) {
          // console.log(props.dtr_list[i]['dtr_id'])
          site_list.push(props.dtr_list[i]['dtr_id'])
        }

        params = {
          vertical: location.pathname.split('/')[1],
          project: location.pathname.split('/')[2],
          module: location.pathname.split('/')[3],
          page: currentPage,
          rows: 10,
          reportId: default_report_type.value,
          ...filterParams,
          siteId: site_list
        }
      }

      // if (filterParams) {
      //   params = {
      //     vertical: location.pathname.split('/')[1],
      //     project: location.pathname.split('/')[2],
      //     module: location.pathname.split('/')[3],
      //     page: currentPage,
      //     rows: 10,
      //     reportId: default_report_type.value,
      //     ...filterParams
      //   }
      // } else {
      //   params = {
      //     vertical: location.pathname.split('/')[1],
      //     project: location.pathname.split('/')[2],
      //     module: location.pathname.split('/')[3],
      //     page: currentPage,
      //     reportId: default_report_type.value,
      //     rows: 10
      //   }
      // }

      // console.log('Params ....')
      // console.log(params)

      const [statusCode, response] = await fetchRechargeReportAnalytics(params)

      // setLoadCommandHistory(false)
      setRetry(false)

      // console.log('Status Code For Response ....')
      // console.log(statusCode)
      // console.log('Response .....')
      // console.log(response.data.data.result.data)

      if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else if (statusCode === 200) {
        // Set Total Row Count
        // setTotalCount(response.data.data.result.totalRowsCount)
        if (currentPage === 1) {
          setTotalCount(response.data.data.result.totalRowsCount)
        }
        // Set Response Data
        setResponse(response.data.data.result.data)
      } else {
        setRetry(false)
        setError(true)
        setErrorMessage('Network Error, please retry')
      }
    }
  }, [retry])

  const onNextPageClicked = page => {
    setCurrentPage(page + 1)
    setRetry(true)
    // setLoadCommandHistory(true)
  }

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
        if (i !== 'id' && i !== 'pss_id' && i !== 'feeder_id' && i !== 'site_id') {
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
                  title={row[i] !== null ? (row[i] !== '' ? (row[i].toString().length > 20 ? row[i] : '') : '-') : '-'}>
                  {row[i] !== null && row[i] !== '' ? row[i].toString().substring(0, 20) : '-'}
                  {row[i] !== null && row[i] !== '' ? (row[i].toString().length > 20 ? '...' : '') : '-'}
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
        <CommonSelector
          dtr_list={props.dtr_list}
          pss_list={props.pss_list}
          feeder_list={props.feeder_list}
          onSearchButtonClicked={onSearchButtonClicked}
          report_types={report_types}
          default_report_type={default_report_type}
        />

        <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
      </div>
    )
  }

  return (
    <div>
      <CommonSelector
        dtr_list={props.dtr_list}
        pss_list={props.pss_list}
        feeder_list={props.feeder_list}
        onSearchButtonClicked={onSearchButtonClicked}
        report_types={report_types}
        default_report_type={default_report_type}
      />

      {!retry && (
        <SimpleDataTableMDAS
          columns={tblColumn()}
          tblData={response}
          rowCount={10}
          tableName={'Communication Report table'}
          refresh={refresh}
          // filter={false}
          // status={props.reloadCommandHistory1}
          currentPage={currentPage}
          totalCount={totalCount}
          onNextPageClicked={onNextPageClicked}
          // protocolSelected={protocolSelected}
          // protocol={props.protocol}
          // extras={SlaReport()}
          // extra_in_center={SlaReport()}
        />
      )}

      {retry && <Loader hight='min-height-233' />}
    </div>
  )
}

export default CommunicationReport
