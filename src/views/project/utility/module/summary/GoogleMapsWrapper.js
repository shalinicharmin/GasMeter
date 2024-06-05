import GoogleApiWrapper from '@src/views/ui-elements/maps/individualProjectMap'
import { Row, Col } from 'reactstrap'
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { handleGoogleMapsData } from '@store/actions/UtilityProject/Summary'
import useJwt from '@src/auth/jwt/useJwt'
import Loader from '@src/views/project/misc/loader'
import dtr from '@src/assets/images/gp_icons/dtr_green.png'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
// import { useDispatch, useSelector } from 'react-redux'
import authLogout from '../../../../../auth/jwt/logoutlogic'
import { useLocation, useHistory } from 'react-router-dom'

const GoogleMapsWrapper = props => {
  const dispatch = useDispatch()
  const history = useHistory()

  // Logout User
  const [logout, setLogout] = useState(false)
  const [hasError, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [retry, setRetry] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const response = useSelector(state => state.UtilitySummaryMapsReducer)

  let responseData = null
  if (response && response.responseData) {
    responseData = response.responseData
  } else {
    responseData = []
  }

  const fetchData = async params => {
    return await useJwt
      .getSummeryGisDtrMdmsModule(params)
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
        project: props.project
      }
      const [statusCode, response] = await fetchData(params)

      if (statusCode === 200) {
        try {
          dispatch(handleGoogleMapsData(response.data.data.result.stat))
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
    <Col lg='8' className='min-height-330'>
      {hasError ? (
        <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
      ) : (
        <>
          {response && !response.callAPI && !retry && <GoogleApiWrapper data={responseData} icon={dtr} />}
          {(!response || response.callAPI || retry) && <Loader hight='min-height-330' />}
        </>
      )}
    </Col>
  )
}

export default GoogleMapsWrapper
