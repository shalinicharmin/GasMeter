import { Row, Col, Card, CardBody, Modal, ModalBody, ModalHeader, Badge, CardHeader, Spinner, Button } from 'reactstrap'
// String to icon tag
import IcoFun from '@src/utility/dynamicIcon'
import RawFun from './rechargeHistoryWrapper'
import Avatar from '@components/avatar'
import { useContext, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { handleConsumerTotalRechargesData } from '@store/actions/UtilityProject/MDMS/userprofile'
import CardPayment from '@src/views/ui-elements/cards/gpCards/cardPayment'
import './wrapper.css'
import no_data from '@src/assets/images/svg/no_data.svg'

import Loader from '@src/views/project/misc/loader'
import useJwt from '@src/auth/jwt/useJwt'

import { useLocation, useHistory } from 'react-router-dom'
import authLogout from '../../../../../../../auth/jwt/logoutlogic'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
import { AlertTriangle, RefreshCw } from 'react-feather'

const TotalRechargesWrapper = props => {
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

  const [centeredModal, setCenteredModal] = useState(false)
  const [fetchRechargeHistory, setFetchRechargeHistory] = useState(false)
  const [rechargeHistory, setRechargeHistory] = useState([])
  const [rechargeReceipt, setRechargeReceipt] = useState({})

  // const dispatch = useDispatch()
  const response = useSelector(state => state.UtilityMdmsConsumerTotalRechargeReducer)
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
      .getUserWalletInformationMDMSModule(params)
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

  const fetchRechargeHistoryData = async params => {
    return await useJwt
      .getUserRechargeHistoryMDMSModule(params)
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
      if (statusCode) {
        if (statusCode === 200) {
          dispatch(handleConsumerTotalRechargesData(response.data.data.result.stat))
          setRetry(false)
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

  useEffect(async () => {
    if (fetchRechargeHistory || retry) {
      const params = {
        project: HierarchyProgress.project_name,
        substation: HierarchyProgress.pss_name,
        feeder: HierarchyProgress.feeder_name,
        dtr: HierarchyProgress.dtr_name,
        sc_no: HierarchyProgress.user_name,
        year: selected_month.year,
        month: selected_month.month
      }

      const [statusCode, response] = await fetchRechargeHistoryData(params)

      if (statusCode === 200) {
        try {
          setRechargeHistory(response.data.data.result.stat)
          setRechargeReceipt(response.data.data.result.stat[0])
          setFetchRechargeHistory(false)
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
  }, [fetchRechargeHistory, retry])

  useEffect(() => {
    if (centeredModal) {
      //Make API call to fetch Data
      setFetchRechargeHistory(true)
      //setRechargeHistory(paymentData)
      //setRechargeReceipt(paymentData[0])
    }
  }, [centeredModal])

  const handleRechargeItemClicked = position => {
    setRechargeReceipt(rechargeHistory[position])
  }
  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }

  return (
    <>
      {/* <StatsHorizontal icon={IcoFun('FileText', 21)} color='warning' stats={rawData.statistics} statTitle={rawData.title} /> */}
      <Card>
        {hasError ? (
          <div>
            {/* <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} /> */}

            <CardBody className='super-center  py_5'>
              <Avatar color='light-danger' size='xl' icon={<AlertTriangle />} />

              <p className='mb-0'>{errorMessage}</p>
              {retry ? (
                <Spinner color='dark' size='md' />
              ) : (
                <Button.Ripple to='/' color='btn btn-outline-danger' className='mt-1 mb_3' onClick={retryAgain}>
                  Retry
                  <RefreshCw size='15' className='cursor-pointer mx_5 ' />
                </Button.Ripple>
              )}
            </CardBody>
          </div>
        ) : (
          <>
            {(!response || response.callAPI) && <Loader hight='min-height-128' />}
            {response && !response.callAPI && (
              <CardBody className='cursor-pointer' onClick={() => setCenteredModal(!centeredModal)}>
                <div className='d-flex justify-content-between align-items-center'>
                  <div>
                    <h2 className='font-weight-bolder mb-0'>{responseData[0].value}</h2>
                    <p className='card-text mb-2'>{responseData[0].title}</p>
                    <h2 className='font-weight-bolder mb-0'>{responseData[1].value}</h2>
                    <p className='card-text'>{responseData[1].title}</p>
                  </div>
                  <div className={`avatar avatar-stats p-50 m-0`}>
                    <div className='avatar-content'>{IcoFun('FileText', 21)}</div>
                  </div>
                </div>
              </CardBody>
            )}
          </>
        )}
      </Card>

      <Modal isOpen={centeredModal} toggle={() => setCenteredModal(!centeredModal)} scrollable className='modal_size h-100'>
        <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>Recharge History</ModalHeader>
        {hasError ? (
          <div className='p-2'>
            <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
          </div>
        ) : (
          <>
            {!fetchRechargeHistory && (
              <ModalBody>
                {rechargeHistory.length > 0 ? (
                  <Row>
                    <Col lg='4' xs='6' className='recharge-col-height'>
                      <RawFun data={rechargeHistory} handleRechargeItemClicked={handleRechargeItemClicked} />
                    </Col>
                    <Col lg='8' xs='6'>
                      <Row className='justify-content-center'>
                        <Col lg='6' xs='12'>
                          <CardPayment data={rechargeReceipt} />
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                ) : (
                  <div className='super-center h-100'>
                    <div>
                      <img src={no_data} style={{ height: '150px', width: '150px' }} />
                      <p className='mt-1 ml-3'>No data found</p>
                    </div>
                  </div>
                )}
              </ModalBody>
            )}
          </>
        )}
      </Modal>
    </>
  )
}

export default TotalRechargesWrapper
