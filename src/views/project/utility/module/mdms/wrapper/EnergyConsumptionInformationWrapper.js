import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable'

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import Loader from '@src/views/project/misc/loader'

import { handleEnergyConsumptionData as handlePssData } from '@store/actions/UtilityProject/MDMS/pss'
import { handleEnergyConsumptionData as handleFeederData } from '@store/actions/UtilityProject/MDMS/feeder'
import { handleEnergyConsumptionData as handleDtrData } from '@store/actions/UtilityProject/MDMS/dtr'
import { handleEnergyConsumptionData as handleUserData } from '@store/actions/UtilityProject/MDMS/user'

import useJwt from '@src/auth/jwt/useJwt'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
import { useLocation, useHistory } from 'react-router-dom'
import authLogout from '../../../../../../auth/jwt/logoutlogic'

import { Badge, Modal, ModalBody, ModalHeader } from 'reactstrap'

//let tbData = []

const EnergyConsumptionWrapper = props => {
  const dispatch = useDispatch()
  const history = useHistory()

  // Error Handling
  const [errorMessage, setErrorMessage] = useState('')
  const [hasError, setError] = useState(false)
  const [retry, setRetry] = useState(false)

  const [page, setpage] = useState(0)
  // console.log(page)
  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const HierarchyProgress = useSelector(state => state.UtilityMDMSHierarchyProgressReducer.responseData)
  const selected_month = useSelector(state => state.calendarReducer.month)

  let response, callAPI, responseData
  let [pss_hierarchy, feeder_hierarchy, dtr_hierarchy, user_hierarchy] = [false, false, false, false]

  if (props.hierarchy === 'pss') {
    response = useSelector(state => state.UtilityMdmsPssEnergyConsumptionReducer)
    pss_hierarchy = true
    // callAPI = useSelector(state => state.UtilityMdmsPssEnergyConsumptionReducer.callAPI)
  } else if (props.hierarchy === 'feeder') {
    response = useSelector(state => state.UtilityMdmsFeederEnergyConsumptionReducer)
    feeder_hierarchy = true
    // callAPI = useSelector(state => state.UtilityMdmsFeederEnergyConsumptionReducer.callAPI)
  } else if (props.hierarchy === 'dtr') {
    response = useSelector(state => state.UtilityMdmsDtrEnergyConsumptionReducer)
    dtr_hierarchy = true
    // callAPI = useSelector(state => state.UtilityMdmsDtrEnergyConsumptionReducer.callAPI)
  } else if (props.hierarchy === 'user') {
    response = useSelector(state => state.UtilityMdmsUserEnergyConsumptionReducer)
    user_hierarchy = true
    // callAPI = useSelector(state => state.UtilityMdmsUserEnergyConsumptionReducer.callAPI)
  }

  if (response && response.responseData) {
    if (response.responseData.length > 0 && response.responseData[0].hasOwnProperty('wallet_balance')) {
      // console.log("Inside If Condition")

      responseData = []

      for (const ele of response.responseData) {
        const wallet_balance = Number(ele['wallet_balance'])
        // console.log(wallet_balance)
        // console.log(ele)
        const temp = {
          ...ele,
          wallet_balance
        }

        responseData.push(temp)
      }
    } else {
      // console.log("Insie Else Condition")

      responseData = response.responseData
    }
  } else {
    responseData = []
  }

  const fetchData = async params => {

    return await useJwt
      .getHierarchyWiseEnergyConsumptionMDMSModule(params)
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
    if (!response || response.callAPI || retry) {
      //setLoader(true)
      //Call API and check response and dispatch
      if (props.hierarchy === 'pss') {
        const params = {
          project: HierarchyProgress.project_name,
          year: selected_month.year,
          month: selected_month.month
        }

        const [statusCode, response] = await fetchData(params)
        //setLoader(false)

        if (statusCode === 200) {
          try {
            dispatch(handlePssData(response.data.data.result.stat))
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
      } else if (props.hierarchy === 'feeder') {
        const params = {
          project: HierarchyProgress.project_name,
          substation: HierarchyProgress.pss_name,
          year: selected_month.year,
          month: selected_month.month
        }

        const [statusCode, response] = await fetchData(params)
        //setLoader(false)

        if (statusCode === 200) {
          try {
            dispatch(handleFeederData(response.data.data.result.stat))
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
        //setLoader(false)

        if (statusCode === 200) {
          try {
            dispatch(handleDtrData(response.data.data.result.stat))
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
        //setLoader(false)

        if (statusCode === 200) {
          try {
            dispatch(handleUserData(response.data.data.result.stat))
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
  }, [response, retry])

  // Check the column length
  const handle_row_element_length = props => {
    for (const i of responseData) {
      if (i[props].length > 25) {
        return true
      }
    }
    return false
  }

  const handleRowClick = data => {
    // console.log(data)
    props.statehandler(data.id, data)
  }
  
  const diff_in_minutes = time => {

    const dateTime = new Date(time)
    const epochTime = dateTime.getTime()
    const epochTimeInSeconds = Math.floor(epochTime / 1000)
    console.log("Epoch Time In Seconds ....")
    console.log(epochTimeInSeconds)
    const currentDateTime = new Date()
    const currentEpochTimeInSeconds = Math.floor(currentDateTime.getTime() / 1000)
    const diffInEpochTimeSeconds = currentEpochTimeInSeconds - epochTimeInSeconds

    console.log("EPoch Time Difference ....")
    console.log(diffInEpochTimeSeconds)

    const diffInEpochTimeMinutes = (diffInEpochTimeSeconds / 60).toFixed(2)
    return diffInEpochTimeMinutes
 
  }
  
  
  const tblColumn = statehandler => {
    const column = []

    for (const i in responseData[0]) {
      const col_config = {}
      if (i !== 'id' && i !== 'meter_protocol_type' && i !== 'grid_id' && i !== 'meter_address') {
        // const get_length = handle_row_element_length(i)

        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replace('_', ' ')
        col_config.serch = i
        col_config.sortable = true
        // col_config.selector = i
        col_config.selector = row => row[i]
        // col_config.minWidth = get_length ? '200px' : '125px'
        // col_config.maxWidth = get_length ? '200px' : '125px'
        // col_config.maxWidth = i === 'feeder' ? '100px' : ''
        //  / col_config.style = {
        //     minHeight: '40px',
        //     maxHeight: '40px'
        //   }

        if ((i === 'LDP') | (i === 'consumer_name') | (i === 'consumer_id')) {
          col_config.width = '170px'
        }

        // if(i=="wallet_blance")
        col_config.cell = row => {
          return (
            <div className='d-flex'>
              <span
                className='d-block font-weight-bold cursor-pointer'
                onClick={() => handleRowClick(row, 'pss')}
                title={row[i] ? (row[i] !== '' ? (row[i].toString().length > 18 ? row[i] : '') : '-') : '-'}>
                {row[i] && row[i] !== '' ? row[i].toString().substring(0, 18) : '-'}
                {row[i] && row[i] !== '' ? (row[i].toString().length > 18 ? '...' : '') : '-'}
              </span>
            </div>
          )
        }
        column.push(col_config)
      }

    }

    if (props.hierarchy === 'user') {
      
      // Alert Light for Meter LDP
      column.push({
        name: 'Live Status',
        width: '120px',
        cell: row => {
          if (row.LDP === 'Na') {
            return (
              <>
                <Badge color='secondary' className='mx_7' id='success'>
                  {/* {row.LDP} */}
                  {' '}
                </Badge>
              </>
            )
          } else if (row.LDP !== 'Na') {
            
            const result = diff_in_minutes(row.LDP)

            console.log("Difference in Minutes Result : ")
            console.log(result)

            if (result >= 0 && result < 20) {

              return (
                <>
                  <Badge color='success' className='mx_7' id='processing'>
                    {/* {row.LDP} */}
                    {' '}
                  </Badge>
                </>
              )

            } else if (result >= 20 && result < 40) {
              return (
                <>
                  <Badge color='warning' className='mx_7' id='processing'>
                    {/* {row.LDP} */}
                    {' '}
                  </Badge>
                </>
              )
            } else if (result >= 40) {
              return (
                <>
                  <Badge color='danger' className='mx_7' id='processing'>
                    {/* {row.LDP} */}
                    {' '}
                  </Badge>
                </>
              )
            }
            
          }
        }
      })
    
    }

    column.unshift({
      name: 'Sr',
      width: '90px',
      cell: (row, i) => {
        return <div className='d-flex  justify-content-center'>{page * 10 + 1 + i}</div>
      }
    })

    return column
  }

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }
  // const handleRowClick = data => {
  //   console.log(data)
  // }

  const content_card = (
    <div className='table-wrapper'>
      <SimpleDataTable
        columns={tblColumn(props.statehandler)}
        tblData={responseData}
        height={props.height ? props.height : false}
        rowCount={10}
        currentpage={page}
        ispagination
        selectedPage={setpage}
        pointerOnHover={true}
        handleRowClick={handleRowClick}
        tableName={props.tableName}
      />
    </div>
  )

  return (
    <div className='h-100 w-100'>
      {hasError ? (
        <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
      ) : (
        <>
          {response && !response.callAPI && !retry && content_card}
          {(!response || response.callAPI || retry) && <Loader hight='min-height-475' />}
        </>
      )}
    </div>
  )
}

export default EnergyConsumptionWrapper
