import { Row, Col } from 'reactstrap'
import AnalyticSmallCard from '@src/views/ui-elements/cards/gpCards/analyticSmallCard'
import MultiStatsHorizontal from '@components/widgets/stats/MultiStatsHorizontal'
import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'
// String to icon tag
import IcoFun from '@src/utility/dynamicIcon'

import { ThemeColors } from '@src/utility/context/ThemeColors'
import { useContext, useState, useEffect } from 'react'

import { useSelector, useDispatch } from 'react-redux'

import { handleUptimeData as handlePssData } from '@store/actions/UtilityProject/MDMS/pss'
import { handleUptimeData as handleFeederData } from '@store/actions/UtilityProject/MDMS/feeder'
import { handleUptimeData as handleDtrData } from '@store/actions/UtilityProject/MDMS/dtr'
import { handleUptimeData as handleUserData } from '@store/actions/UtilityProject/MDMS/user'

import Loader from '@src/views/project/misc/loader'

import useJwt from '@src/auth/jwt/useJwt'

import authLogout from '../../../../../../auth/jwt/logoutlogic'

import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
const UptimeWrapper = props => {
  const dispatch = useDispatch()
  const HierarchyProgress = useSelector(state => state.UtilityMDMSHierarchyProgressReducer.responseData)
  const selected_month = useSelector(state => state.calendarReducer.month)

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

  let response, callAPI, responseData

  if (props.hierarchy === 'pss') {
    response = useSelector(state => state.UtilityMdmsPssUptimeReducer)
  } else if (props.hierarchy === 'feeder') {
    response = useSelector(state => state.UtilityMdmsFeederUptimeReducer)
  } else if (props.hierarchy === 'dtr') {
    response = useSelector(state => state.UtilityMdmsDtrUptimeReducer)
  } else if (props.hierarchy === 'user') {
    response = useSelector(state => state.UtilityMdmsUserUptimeReducer)
  }

  if (response && response.responseData && response.responseData.length > 0) {
    responseData = response.responseData
  } else {
    responseData = [
      {
        value: '00',
        title: 'xx'
      }
    ]
  }

  // if (response && response.callAPI) {
  //   callAPI = callAPI
  // } else {
  //   callAPI = true
  // }

  const { colors } = useContext(ThemeColors)

  const fetchData = async params => {
    return await useJwt
      .getHierarchyWiseUptimeMDMSModule(params)
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
      // const data = {
      //   title: 'Aug 21 Uptime',
      //   statistics: '95%',
      //   series: [
      //     {
      //       data: [0, 20, 5, 30, 15, 45]
      //     }
      //   ]
      // }
      //Call API and check response and dispatch
      if (props.hierarchy === 'pss') {
        const params = {
          project: HierarchyProgress.project_name,
          year: selected_month.year,
          month: selected_month.month
        }

        const [statusCode, response] = await fetchData(params)

        if (statusCode === 200) {
          try {
            dispatch(handlePssData(response.data.data.result.stat))
            //dispatch(handlePssData(data))
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

        // console.log('Average Uptime Data ....')
        // console.log(response.data.data.result.stat)

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

  const content_card = (
    <StatsHorizontal icon={IcoFun('TrendingUp', 21)} color='info' stats={responseData[0].value.toString()} statTitle={responseData[0].title} />
  )

  const multi_content_card = <MultiStatsHorizontal icon={IcoFun('TrendingUp', 21)} color='info' stats={JSON.stringify(responseData)} />

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }
  return (
    <>
      {hasError ? (
        <Col xs='12'>
          <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
        </Col>
      ) : (
        <>
          {props.multi ? (
            <Col xs='12'>
              {response && !response.callAPI && !retry && multi_content_card}
              {(!response || response.callAPI || retry) && <Loader hight='min-height-92' />}
            </Col>
          ) : (
            <Col xs='6'>
              {response && !response.callAPI && !retry && content_card}
              {(!response || response.callAPI || retry) && <Loader hight='min-height-92' />}
            </Col>
          )}
        </>
      )}
    </>
  )
}

export default UptimeWrapper
