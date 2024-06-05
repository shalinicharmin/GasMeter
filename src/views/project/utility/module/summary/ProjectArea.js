import CardProjectArea from '@src/views/ui-elements/cards/advance/CardProjectArea'
import { Row, Col } from 'reactstrap'
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { handleProjectArea } from '@store/actions/UtilityProject/Summary'
import useJwt from '@src/auth/jwt/useJwt'
import Loader from '@src/views/project/misc/loader'
import Button from 'reactstrap/lib/Button'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
import authLogout from '../../../../../auth/jwt/logoutlogic'
import { Link, useHistory } from 'react-router-dom'
import { handleLogout } from '@store/actions/auth'
import { handleCalendarMonthUpdated, resetAllDataExceptCalendarAndHierarchy } from '@store/actions/navbar/calendar'

const ProjectArea = props => {
  const dispatch = useDispatch()
  const history = useHistory()
  const response = useSelector(state => state.UtilitySummaryProjectAreaReducer)
  const selected_month = useSelector(state => state.calendarReducer.month)
  const [hasError, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [retry, setRetry] = useState(false)

  // console.log(retry)
  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  let responseData = null
  if (response && response.responseData) {
    responseData = response.responseData
  } else {
    responseData = []
  }

  const fetchData = async params => {
    return await useJwt
      .getSummeryProjectAreaMdmsModule(params)
      .then(res => {
        const status = res.status
        return [status, res]
      })
      .catch(err => {
        // console.log('Error response ....')
        // console.log(err)

        // console.log('Project Area Response ....')
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
    // console.log('Response Project Area .....')
    // console.log(response)

    if (!response || response.callAPI || retry) {
      const params = {
        project: props.project,
        year: selected_month.year,
        month: selected_month.month
      }

      const [statusCode, response] = await fetchData(params)
      // setLogout(true)

      if (statusCode === 200) {
        try {
          dispatch(handleProjectArea(response.data.data.result.stat))
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

  if (hasError) {
    return (
      <Col xl='4'>
        <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
      </Col>
    )
  }

  return (
    <Col xl='4'>
      {response && !response.callAPI && !retry && <CardProjectArea data={responseData} />}
      {(!response || response.callAPI || retry) && <Loader hight='min-height-233' />}
    </Col>
  )
}

export default ProjectArea
