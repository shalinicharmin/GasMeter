import CardinlineMultiDataSLA from '@src/views/ui-elements/cards/statistics/cardinlineMultiDataSLA'
import { Row, Col, Card } from 'reactstrap'

import { useContext, useState, useEffect } from 'react'
import Loader from '@src/views/project/misc/loader'

import { useSelector, useDispatch } from 'react-redux'

import { handleSLAInformationData } from '@store/actions/UtilityProject/MDMS/user'

import useJwt from '@src/auth/jwt/useJwt'

import { useLocation, useHistory } from 'react-router-dom'
import authLogout from '../../../../../../auth/jwt/logoutlogic'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'

const SLAInformationWrapper = props => {
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
  // console.log("Hierarchy Progress ....")
  // console.log(HierarchyProgress)
  const selected_month = useSelector(state => state.calendarReducer.month)

  // const dispatch = useDispatch()

  let callAPI, responseData

  const response = useSelector(state => state.UtilityMdmsDtrSLAInformationReducer)

  const [reloadSLA, setReloadSLA] = useState(false)

  if (response && response.responseData) {
    responseData = response.responseData
  } else {
    responseData = []
  }

  const fetchSLAData = async params => {
    return await useJwt
      .getHierarchyWiseDTRLevelSlaMDMSModule(params)
      .then(res => {
        const status = res.status
        return [status, res]
      })
      .catch(err => {
        // console.log('Error Response .....')
        // console.log(err)

        if (err.response) {
          const status = err.response.status
          return [status, err]
        } else {
          return [0, err]
        }
      })
  }

  const reloadSLAData = async params => {
    return await useJwt
      .reloadHierarchyWiseDTRLevelSlaMDMSModule(params)
      .then(res => {
        const status = res.status
        return [status, res]
      })
      .catch(err => {
        // console.log('Error Response .....')
        // console.log(err)

        if (err.response) {
          const status = err.response.status
          return [status, err]
        } else {
          return [0, err]
        }
      })
  }

  const refresh = () => {
    // console.log("Refresh Button Called  ....")
    dispatch(handleSLAInformationData([], true))
    setReloadSLA(true)
  }

  useEffect(async () => {
    if (!response || response.callAPI || retry) {
      if (!reloadSLA) {
        const params = {
          site_id: HierarchyProgress.dtr_name
        }

        const finalResponse = []
        const [statusCode2, response2] = await fetchSLAData(params)

        if (statusCode2 === 200) {
          try {
            finalResponse.push(...response2.data.data.result)
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

        dispatch(handleSLAInformationData(finalResponse))
      } else {
        const params = {
          site_id: HierarchyProgress.dtr_name
        }

        const [statusCode2, response2] = await reloadSLAData(params)

        if (statusCode2 === 200) {
          const finalResponse = []
          // Again call FetchSLA Data
          const [statusCode3, response3] = await fetchSLAData(params)

          if (statusCode3 === 200) {
            try {
              finalResponse.push(...response3.data.data.result)
              setRetry(false)
            } catch (error) {
              setRetry(false)
              setError(true)
              setErrorMessage('Something went wrong, please retry')
            }
          } else if (statusCode3 === 401 || statusCode3 === 403) {
            setLogout(true)
          } else {
            setRetry(false)
            setError(true)
            setErrorMessage('Network Error, please retry')
          }

          dispatch(handleSLAInformationData(finalResponse))
        } else if (statusCode2 === 401 || statusCode2 === 403) {
          setLogout(true)
        }
      }
    }
  }, [response, retry])

  useEffect(() => {
    try {
      props.setHeight(document.getElementById('getHeight').clientHeight)
    } catch (err) {}
  })

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }
  const content_card = <CardinlineMultiDataSLA refresh={refresh} cols={props.cols ? props.cols : { xl: '3', md: '4', sm: '6' }} data={responseData} />

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

export default SLAInformationWrapper
