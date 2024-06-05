import { Col } from 'reactstrap'
import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'
import { AlertTriangle, RefreshCw, TrendingUp } from 'react-feather'
import GraphModalWrapper from './graphModalWrapper/graphModalWrapper'

import { useState, useEffect } from 'react'

import { useSelector, useDispatch } from 'react-redux'

import { handleConsumerTotalConsumptionData } from '@store/actions/UtilityProject/MDMS/userprofile'
import Loader from '@src/views/project/misc/loader'
import useJwt from '@src/auth/jwt/useJwt'

import { useLocation, useHistory } from 'react-router-dom'
import authLogout from '../../../../../../../auth/jwt/logoutlogic'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'

const TotalConsumptionWrapper = props => {
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

  const response = useSelector(state => state.UtilityMdmsConsumerConsumptionReducer)
  const HierarchyProgress = useSelector(state => state.UtilityMDMSHierarchyProgressReducer.responseData)
  const selected_month = useSelector(state => state.calendarReducer.month)
  // const callAPI = useSelector(state => state.UtilityMdmsConsumerConsumptionReducer.callAPI)

  const [centeredModal, setCenteredModal] = useState(false)

  let responseData
  if (response && response.responseData) {
    responseData = response.responseData
  } else {
    responseData = []
  }

  const handleCenterModalState = state => {
    setCenteredModal(state)
  }

  const fetchData = async params => {
    return await useJwt
      .getUserConsumptionInformationMDMSModule(params)
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
      const params = {
        project: HierarchyProgress.project_name,
        substation: HierarchyProgress.pss_name,
        feeder: HierarchyProgress.feeder_name,
        dtr: HierarchyProgress.dtr_name,
        sc_no: HierarchyProgress.user_name,
        year: selected_month.year,
        month: selected_month.month
      }

      const [statusCode, response] = await fetchData(params)

      if (statusCode === 200) {
        try {
          dispatch(handleConsumerTotalConsumptionData(response.data.data.result.stat))
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
  }, [response, retry])

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }
  return (
    <>
      {hasError ? (
        <div>
          {/* <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} /> */}
          <StatsHorizontal
            icon={retry ? <Spinner color='dark' size='md' /> : <RefreshCw size='15' className='cursor-pointer mx_5' />}
            color='danger'
            stats={''}
            statTitle={errorMessage}
            click={retryAgain}
            dvClas={props.dvClas ? props.dvClas : ''}
          />
        </div>
      ) : (
        <>
          {(!response || response.callAPI) && <Loader hight='min-height-99' />}
          {response && !response.callAPI && (
            <StatsHorizontal
              icon={<TrendingUp size={21} />}
              color='info'
              stats={responseData[0].value.toString()}
              statTitle={responseData[0].title}
              click={() => handleCenterModalState(true)}
              dvClas={props.dvClas ? props.dvClas : ''}
            />
          )}
        </>
      )}
      {centeredModal && (
        <GraphModalWrapper
          title={'Day to Day Consumption in kWh'}
          type={'kWh'}
          params={'KWH'}
          isOpen={centeredModal}
          handleCenterModalState={handleCenterModalState}
          label={'kWh'}
          unitType={'kWh'}
        />
      )}
    </>
  )
}

export default TotalConsumptionWrapper
