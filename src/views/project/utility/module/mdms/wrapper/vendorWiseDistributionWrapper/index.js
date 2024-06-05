import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable'

import '@styles/react/libs/charts/apex-charts.scss'
import '@styles/base/pages/dashboard-ecommerce.scss'

// import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'
import authLogout from '../../../../../../../auth/jwt/logoutlogic'

import Loader from '@src/views/project/misc/loader'

import useJwt from '@src/auth/jwt/useJwt'

// import { useSelector } from 'react-redux'
import { useContext, useState, useEffect } from 'react'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
//let tbData = []

const VendorWiseDestribution = props => {
  const dispatch = useDispatch()
  const history = useHistory()

  // Error Handling
  const [errorMessage, setErrorMessage] = useState('')
  const [hasError, setError] = useState(false)
  const [retry, setRetry] = useState(false)

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const [callAPI, setCallAPI] = useState(true)
  const [APIResponse, setAPIResponse] = useState([])
  const HierarchyProgress = useSelector(state => state.UtilityMDMSHierarchyProgressReducer.responseData)
  const selected_month = useSelector(state => state.calendarReducer.month)

  const fetchData = async params => {
    return await useJwt
      .getAssetWiseBillDistributionMDMSModule(params)
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
    if (callAPI || retry) {
      if (props.hierarchy === 'pss') {
        const params = {
          project: HierarchyProgress.project_name,
          year: selected_month.year,
          month: selected_month.month
        }

        const [statusCode, response] = await fetchData(params)

        setCallAPI(false)
        if (statusCode === 200) {
          try {
            setAPIResponse(response.data.data.result.stat)
            // dispatch(handlePssData(response.data.data.result.stat))
            setRetry(false)
          } catch (error) {
            setRetry(false)
            setError(true)
            setErrorMessage('Something went wrong, please retry')
          }
        } else if (statusCode === 401 || statusCode === 403) {
        } else {
          setRetry(false)
          setError(true)
          setErrorMessage('Network Error, please retry')
        }
      } else if (props.hierarchy === 'feeder') {
        const params = {
          project: HierarchyProgress.project_name,
          substation: HierarchyProgress.pss_name,
          year: selected_month.year,
          month: selected_month.month
        }

        const [statusCode, response] = await fetchData(params)

        setCallAPI(false)
        if (statusCode === 200) {
          try {
            setAPIResponse(response.data.data.result.stat)
            // dispatch(handleFeederData(response.data.data.result.stat))
            setRetry(false)
          } catch (error) {
            setRetry(false)
            setError(true)
            setErrorMessage('Something went wrong, please retry')
          }
        } else if (statusCode === 401 || statusCode === 403) {
          setLogout(true)
        } else {
          setRetry(false)
          setError(true)
          setErrorMessage('Network Error, please retry')
        }
      } else if (props.hierarchy === 'dtr') {
        const params = {
          project: HierarchyProgress.project_name,
          substation: HierarchyProgress.pss_name,
          feeder: HierarchyProgress.feeder_name,
          year: selected_month.year,
          month: selected_month.month
        }

        const [statusCode, response] = await fetchData(params)

        setCallAPI(false)
        if (statusCode === 200) {
          try {
            setAPIResponse(response.data.data.result.stat)
            // dispatch(handleDtrData(response.data.data.result.stat))
            setRetry(false)
          } catch (error) {
            setRetry(false)
            setError(true)
            setErrorMessage('Something went wrong, please retry')
          }
        } else if (statusCode === 401 || statusCode === 403) {
          setLogout(true)
        } else {
          setRetry(false)
          setError(true)
          setErrorMessage('Network Error, please retry')
        }
      } else if (props.hierarchy === 'user') {
        const params = {
          project: HierarchyProgress.project_name,
          substation: HierarchyProgress.pss_name,
          feeder: HierarchyProgress.feeder_name,
          dtr: HierarchyProgress.dtr_name,
          year: selected_month.year,
          month: selected_month.month
        }

        const [statusCode, response] = await fetchData(params)

        setCallAPI(false)
        if (statusCode === 200) {
          try {
            // dispatch(handleUserData(response.data.data.result.stat))
            setAPIResponse(response.data.data.result.stat)
            setRetry(false)
          } catch (error) {
            setRetry(false)
            setError(true)
            setErrorMessage('Something went wrong, please retry')
          }
        } else if (statusCode === 401 || statusCode === 403) {
          setLogout(true)
        } else {
          setRetry(false)
          setError(true)
          setErrorMessage('Network Error, please retry')
        }
      }
    }
  }, [callAPI, retry])

  const tblColumn = statehandler => {
    const column = []

    const handleRowClick = (id, type) => {
      // statehandler(id)
    }

    for (const i in APIResponse[0]) {
      const col_config = {}
      if (i !== 'id') {
        // const get_length = handle_row_element_length(i)

        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
        col_config.serch = i
        col_config.sortable = true
        col_config.selector = row => row[i]
        // col_config.minWidth = get_length ? '200px' : '125px'
        // col_config.maxWidth = get_length ? '200px' : '125px'
        // col_config.maxWidth = i === 'feeder' ? '100px' : ''
        col_config.style = {
          minHeight: '40px',
          maxHeight: '40px'
        }
        col_config.cell = row => {
          return (
            <div className='d-flex'>
              <span
                className='d-block font-weight-bold text-truncate cursor-pointer'
                onClick={() => handleRowClick(row.id, 'pss')}
                title={row[i] ? (row[i] !== '' ? (row[i].toString().length > 10 ? row[i] : '') : '-') : '-'}>
                {row[i] && row[i] !== '' ? row[i].toString().substring(0, 10) : '-'}
                {row[i] && row[i] !== '' ? (row[i].toString().length > 10 ? '...' : '') : '-'}
              </span>
            </div>
          )
        }
        column.push(col_config)
      }
    }
    return column
  }

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }

  const content_card = <SimpleDataTable columns={tblColumn(props.statehandler)} tblData={APIResponse} rowCount={8} tableName={props.tableName} />

  return (
    <div className='h-100 w-100'>
      {hasError ? (
        <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
      ) : (
        <>
          {!callAPI && !retry && content_card}
          {(callAPI || retry) && <Loader hight='min-height-158' />}
        </>
      )}
    </div>
  )
}

export default VendorWiseDestribution
