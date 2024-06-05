import CardinlineMultiData from '@src/views/ui-elements/cards/statistics/cardinlineMultiData'
import { Row, Col } from 'reactstrap'
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { handleOperationalStatistics } from '@store/actions/UtilityProject/Summary'
import useJwt from '@src/auth/jwt/useJwt'
import Loader from '@src/views/project/misc/loader'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
import { useLocation, useHistory } from 'react-router-dom'
import authLogout from '../../../../../auth/jwt/logoutlogic'

const ProjectArea = props => {
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

  const response = useSelector(state => state.UtilitySummaryOperationalStatisticsReducer)
  const selected_month = useSelector(state => state.calendarReducer.month)

  let responseData = null
  if (response && response.responseData) {
    responseData = response.responseData
  } else {
    responseData = []
  }

  const fetchData = async params => {
    return await useJwt
      .getSummeryOperationalStaticsMdmsModule(params)
      .then(res => {
        const status = res.status
        return [status, res]
      })
      .catch(err => {
        // console.log('Operational Statistics Error  ....')
        // console.log(err)
        // console.log(err.response)

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
        project: props.project,
        year: selected_month.year,
        month: selected_month.month
      }

      const [statusCode, response] = await fetchData(params)

      if (statusCode === 200) {
        try {
          dispatch(handleOperationalStatistics(response.data.data.result.stat))
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
    <Col xl='8' md='6' xs='12'>
      {hasError ? (
        <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
      ) : (
        <>
          {response && !response.callAPI && !retry && <CardinlineMultiData cols={{ xl: '4', sm: '6' }} data={responseData} />}
          {(!response || response.callAPI || retry) && <Loader hight='min-height-310' />}
        </>
      )}
    </Col>
  )
}

export default ProjectArea
