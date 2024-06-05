import UserDetailCard from '@src/views/ui-elements/cards/gpCards/userDetailNewCard'
import { Row, Col, Card, CardBody, Spinner, Button } from 'reactstrap'

import { useContext, useState, useEffect } from 'react'

import { useSelector, useDispatch } from 'react-redux'

import { handleConsumerProfileInformationData } from '@store/actions/UtilityProject/MDMS/userprofile'

import Loader from '@src/views/project/misc/loader'

import useJwt from '@src/auth/jwt/useJwt'
import Avatar from '@components/avatar'
import { useLocation, useHistory } from 'react-router-dom'
import authLogout from '../../../../../../../auth/jwt/logoutlogic'

import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
import { AlertTriangle, RefreshCw } from 'react-feather'

const UserDetailWrapper = props => {
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
  const response = useSelector(state => state.UtilityMdmsConsumerProfileInformationReducer)
  const HierarchyProgress = useSelector(state => state.UtilityMDMSHierarchyProgressReducer.responseData)
  const selected_month = useSelector(state => state.calendarReducer.month)

  let responseData
  if (response && response.responseData) {
    responseData = response.responseData
  } else {
    responseData = []
  }

  const fetchData = async params => {
    return await useJwt
      .getUserPersonalInformationMDMSModuleUpdated(params)
      .then(res => {
        const status = res.status
        // console.log(res)
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
          dispatch(handleConsumerProfileInformationData(response.data.data.result.stat))
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
    <div>
      {hasError ? (
        <div>
          {/* <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} /> */}
          <Card>
            <CardBody className='super-center '>
              <Avatar color='light-danger' size='xl' icon={<AlertTriangle />} />
              <h4 className='mt-2'>Network Error Occured 🕵🏻‍♀️</h4>
              <p className='mb-2 mt-1'> {errorMessage}</p>
              {retry ? (
                <Spinner color='dark' size='md' />
              ) : (
                <Button.Ripple to='/' color='btn btn-outline-danger' onClick={retryAgain} className='mb_3'>
                  Retry
                  <RefreshCw size='15' className='cursor-pointer mx_5' />
                </Button.Ripple>
              )}
            </CardBody>
          </Card>
        </div>
      ) : (
        <>
          {(!response || response.callAPI) && <Loader hight={props.height} />}
          {response && responseData.hasOwnProperty('primaryInformation') && responseData.primaryInformation.length && (
            <UserDetailCard data={responseData} height={props.height} />
          )}
        </>
      )}
    </div>
  )
}

export default UserDetailWrapper
