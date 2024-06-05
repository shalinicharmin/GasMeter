import CardinlineMultiData from '@src/views/ui-elements/cards/statistics/cardinlineMultiData'
import { Row, Col, Card } from 'reactstrap'

import { useContext, useState, useEffect } from 'react'
import Loader from '@src/views/project/misc/loader'

import { useSelector, useDispatch } from 'react-redux'

import { handleOpertationalStatisticsData as handlePssData } from '@store/actions/UtilityProject/MDMS/pss'
import { handleOpertationalStatisticsData as handleFeederData } from '@store/actions/UtilityProject/MDMS/feeder'
import { handleOpertationalStatisticsData as handleDtrData } from '@store/actions/UtilityProject/MDMS/dtr'
import { handleOpertationalStatisticsData as handleUserData } from '@store/actions/UtilityProject/MDMS/user'

import useJwt from '@src/auth/jwt/useJwt'

import { useLocation, useHistory } from 'react-router-dom'
import authLogout from '../../../../../../auth/jwt/logoutlogic'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'

const OperationalInformationWrapper = props => {
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

  const HierarchyProgress = useSelector(state => state.UtilityMDMSHierarchyProgressReducer.responseData)
  const selected_month = useSelector(state => state.calendarReducer.month)

  // const dispatch = useDispatch()

  let response, callAPI, responseData

  if (props.hierarchy === 'pss') {
    response = useSelector(state => state.UtilityMdmsPssOperationalStatisticsReducer)
  } else if (props.hierarchy === 'feeder') {
    response = useSelector(state => state.UtilityMdmsFeederOperationalStatisticsReducer)
  } else if (props.hierarchy === 'dtr') {
    response = useSelector(state => state.UtilityMdmsDtrOperationalStatisticsReducer)
  } else if (props.hierarchy === 'user') {
    response = useSelector(state => state.UtilityMdmsUserOperationalStatisticsReducer)
  }

  if (response && response.responseData) {
    responseData = response.responseData
  } else {
    responseData = []
  }

  const fetchConsumptionData = async params => {
    return await useJwt
      .getHierarchyWiseOperationalStatisticsEnergyMDMSModule(params)
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

  const fetchRechargeData = async params => {
    return await useJwt
      .getHierarchyWiseOperationalStatisticsRechargesMDMSModule(params)
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

  const fetchMeterCountData = async params => {
    return await useJwt
      .getHierarchyWiseOperationalStatisticsMeterCountMDMSModule(params)
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
      //Call API and check response and dispatch
      //Call API and check response and dispatch
      if (props.hierarchy === 'pss') {
        const params = {
          project: HierarchyProgress.project_name,
          year: selected_month.year,
          month: selected_month.month
        }

        const finalResponse = []
        const [statusCode, response] = await fetchConsumptionData(params)
        if (statusCode) {
          if (statusCode === 200) {
            try {
              finalResponse.push(...response.data.data.result.stat)
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

        const [statusCode1, response1] = await fetchRechargeData(params)
        if (statusCode1) {
          if (statusCode1 === 200) {
            try {
              finalResponse.push(...response1.data.data.result.stat)
              setRetry(false)
            } catch (error) {
              setRetry(false)
              setError(true)
              setErrorMessage('Something went wrong, please retry')
            }
          } else if (statusCode1 === 401 || statusCode1 === 403) {
            setLogout(true)
          } else {
            setRetry(false)
            setError(true)
            setErrorMessage('Network Error, please retry')
          }
        }

        const [statusCode2, response2] = await fetchMeterCountData(params)
        if (statusCode2) {
          if (statusCode1 === 200) {
            try {
              finalResponse.push(...response2.data.data.result.stat)
              setRetry(false)
            } catch (error) {
              setRetry(false)
              setError(true)
              setErrorMessage('Something went wrong, please retry')
            }
          } else if (statusCode1 === 401 || statusCode1 === 403) {
            setLogout(true)
          } else {
            setRetry(false)
            setError(true)
            setErrorMessage('Network Error, please retry')
          }
        }

        dispatch(handlePssData(finalResponse))
      } else if (props.hierarchy === 'feeder') {
        const params = {
          project: HierarchyProgress.project_name,
          substation: HierarchyProgress.pss_name,
          year: selected_month.year,
          month: selected_month.month
        }

        const finalResponse = []
        const [statusCode, response] = await fetchConsumptionData(params)
        if (statusCode) {
          if (statusCode === 200) {
            try {
              finalResponse.push(...response.data.data.result.stat)
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

        const [statusCode1, response1] = await fetchRechargeData(params)
        if (statusCode1) {
          if (statusCode1 === 200) {
            try {
              finalResponse.push(...response1.data.data.result.stat)
              setRetry(false)
            } catch (error) {
              setRetry(false)
              setError(true)
              setErrorMessage('Something went wrong, please retry')
            }
          } else if (statusCode1 === 401 || statusCode1 === 403) {
            setLogout(true)
          } else {
            setRetry(false)
            setError(true)
            setErrorMessage('Network Error, please retry')
          }
        }

        const [statusCode2, response2] = await fetchMeterCountData(params)
        if (statusCode2) {
          if (statusCode1 === 200) {
            try {
              finalResponse.push(...response2.data.data.result.stat)
              setRetry(false)
            } catch (error) {
              setRetry(false)
              setError(true)
              setErrorMessage('Something went wrong, please retry')
            }
          } else if (statusCode1 === 401 || statusCode1 === 403) {
            setLogout(true)
          } else {
            setRetry(false)
            setError(true)
            setErrorMessage('Network Error, please retry')
          }
        }

        dispatch(handleFeederData(finalResponse))
      } else if (props.hierarchy === 'dtr') {
        const params = {
          project: HierarchyProgress.project_name,
          substation: HierarchyProgress.pss_name,
          feeder: HierarchyProgress.feeder_name,
          year: selected_month.year,
          month: selected_month.month
        }

        const finalResponse = []
        const [statusCode, response] = await fetchConsumptionData(params)
        if (statusCode) {
          if (statusCode === 200) {
            try {
              finalResponse.push(...response.data.data.result.stat)
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

        const [statusCode1, response1] = await fetchRechargeData(params)
        if (statusCode1) {
          if (statusCode1 === 200) {
            try {
              finalResponse.push(...response1.data.data.result.stat)
              setRetry(false)
            } catch (error) {
              setRetry(false)
              setError(true)
              setErrorMessage('Something went wrong, please retry')
            }
          } else if (statusCode1 === 401 || statusCode1 === 403) {
            setLogout(true)
          } else {
            setRetry(false)
            setError(true)
            setErrorMessage('Network Error, please retry')
          }
        }

        const [statusCode2, response2] = await fetchMeterCountData(params)
        if (statusCode2) {
          if (statusCode1 === 200) {
            try {
              finalResponse.push(...response2.data.data.result.stat)
              setRetry(false)
            } catch (error) {
              setRetry(false)
              setError(true)
              setErrorMessage('Something went wrong, please retry')
            }
          } else if (statusCode1 === 401 || statusCode1 === 403) {
            setLogout(true)
          } else {
            setRetry(false)
            setError(true)
            setErrorMessage('Network Error, please retry')
          }
        }

        dispatch(handleDtrData(finalResponse))
      } else if (props.hierarchy === 'user') {
        const params = {
          project: HierarchyProgress.project_name,
          substation: HierarchyProgress.pss_name,
          feeder: HierarchyProgress.feeder_name,
          dtr: HierarchyProgress.dtr_name,
          year: selected_month.year,
          month: selected_month.month
        }

        const finalResponse = []
        const [statusCode, response] = await fetchConsumptionData(params)

        if (statusCode === 200) {
          try {
            finalResponse.push(...response.data.data.result.stat)
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

        const [statusCode1, response1] = await fetchRechargeData(params)

        if (statusCode1 === 200) {
          try {
            finalResponse.push(...response1.data.data.result.stat)
            setRetry(false)
          } catch (error) {
            setRetry(false)
            setError(true)
            setErrorMessage('Something went wrong, please retry')
          }
        } else if (statusCode1 === 401 || statusCode1 === 403) {
          setLogout(true)
        } else {
          setRetry(false)
          setError(true)
          setErrorMessage('Network Error, please retry')
        }

        const [statusCode2, response2] = await fetchMeterCountData(params)

        if (statusCode2 === 200) {
          try {
            finalResponse.push(...response2.data.data.result.stat)
            setRetry(false)
          } catch (error) {
            setRetry(false)
            setError(true)
            setErrorMessage('Something went wrong, please retry')
          }
        } else if (statusCode2 === 401 || statusCode2 === 403) {
          setLogout(true)
        } else {
          setRetry(false)
          setError(true)
          setErrorMessage('Network Error, please retry')
        }

        dispatch(handleUserData(finalResponse))
      }
    }
  }, [response, retry])

  useEffect(() => {
    try {
      props.setHeight(document.getElementById('getHeight').clientHeight)
    } catch (err) {}
  })

  const content_card = <CardinlineMultiData cols={props.cols ? props.cols : { xl: '3', md: '4', sm: '6' }} data={responseData} />

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }

  return (
    <Col lg='12' id='getHeight'>
      {hasError ? (
        <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
      ) : (
        <>
          {response && !response.callAPI && !retry && content_card}
          {(!response || response.callAPI || retry) && <Loader hight={props.height ? props.height : 'min-height-176'} />}
        </>
      )}
    </Col>
  )
}

export default OperationalInformationWrapper
