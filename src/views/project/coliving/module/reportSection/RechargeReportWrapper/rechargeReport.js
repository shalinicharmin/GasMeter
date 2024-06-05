// import React from 'react'
import CommonSelector from '@src/views/project/coliving/module/reportSection/selection/commonSelector.js'

import SimpleDataTableMDAS from '@src/views/ui-elements/dtTable/simpleTableMDASUpdated'
import React, { useEffect, useState } from 'react'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
import useJwt from '@src/auth/jwt/useJwt'
import Loader from '@src/views/project/misc/loader'
// import { useLocation } from 'react-router-dom'
import { getDefaultDateRange } from '@src/utility/Utils.js'

import authLogout from '@src/auth/jwt/logoutlogic.js'
import { useDispatch } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'
import { Card, CardBody } from 'reactstrap'
import { caseInsensitiveSort } from '@src/views/utils.js'

const RechargeReport = props => {
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

  // const [loadCommandHistory, setLoadCommandHistory] = useState(true)

  const [filterParams, setFilterParams] = useState(getDefaultDateRange())

  const onSearchButtonClicked = val => {
    // console.log('Search Button Clicked ....')
    // console.log(val)
    setFilterParams(val)
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
      .getAnalyticsReport(params)
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
      params = {
        vertical: location.pathname.split('/')[1],
        project: location.pathname.split('/')[2],
        module: location.pathname.split('/')[3],
        page: currentPage,
        rows: 10,
        reportId: 2001,
        ...filterParams
      }
      // if (filterParams) {
      //   params = {
      //     vertical: location.pathname.split('/')[1],
      //     project: location.pathname.split('/')[2],
      //     module: location.pathname.split('/')[3],
      //     page: currentPage,
      //     rows: 10,
      //     reportId: 2001,
      //     ...filterParams
      //   }
      // } else {
      //   params = {
      //     vertical: location.pathname.split('/')[1],
      //     project: location.pathname.split('/')[2],
      //     module: location.pathname.split('/')[3],
      //     page: currentPage,
      //     rows: 10,
      //     reportId: 2001
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
        setTotalCount(response.data.data.result.totalRowsCount)
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
    const custom_width = ['pss_name', 'site_name']

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

          if (custom_width.includes(i)) {
            col_config.width = '240px'
          }

          col_config.cell = row => {
            // console.log('Printing Row ....')
            // console.log(row)

            return (
              <div className='d-flex'>
                <span
                  className='d-block font-weight-bold text-truncate'
                  title={row[i] ? (row[i] !== '' ? (row[i].toString().length > 25 ? row[i] : '') : '-') : '-'}>
                  {row[i] && row[i] !== '' ? row[i].toString().substring(0, 25) : '-'}
                  {row[i] && row[i] !== '' ? (row[i].toString().length > 25 ? '...' : '') : '-'}
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

  return (
    <div>
      <Card>
        <CardBody className='p-0'>
          {hasError ? (
            <div>
              <CommonSelector
                dtr_list={props.dtr_list}
                pss_list={props.pss_list}
                feeder_list={props.feeder_list}
                onSearchButtonClicked={onSearchButtonClicked}
              />
              <hr />
              <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
            </div>
          ) : (
            <>
              <CommonSelector
                dtr_list={props.dtr_list}
                pss_list={props.pss_list}
                feeder_list={props.feeder_list}
                onSearchButtonClicked={onSearchButtonClicked}
              />
              {!retry && (
                <SimpleDataTableMDAS
                  columns={tblColumn()}
                  tblData={response}
                  rowCount={10}
                  tableName={'Recharge Report table'}
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
            </>
          )}
          {retry && <Loader hight='min-height-233' />}
        </CardBody>
      </Card>
    </div>
  )
}

export default RechargeReport
