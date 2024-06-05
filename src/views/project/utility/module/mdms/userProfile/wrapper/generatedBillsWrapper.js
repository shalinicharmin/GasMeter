import { Row, Col, Modal, ModalHeader, ModalBody, Badge, Card, CardBody, Button } from 'reactstrap'
import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'
import { FileText } from 'react-feather'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import './wrapper.css'

import Loader from '@src/views/project/misc/loader'
import useJwt from '@src/auth/jwt/useJwt'

import no_data from '@src/assets/images/svg/no_data.svg'

import { useLocation, useHistory } from 'react-router-dom'
import authLogout from '../../../../../../../auth/jwt/logoutlogic'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'

const GeneratedBillsWrapper = props => {
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
  const [jsonModal, setJsonModal] = useState(false)
  const [fetchBillingHistory, setFetchBillingHistoryData] = useState(false)
  const [billingHistory, setBillingHistory] = useState([])
  const [billURL, setBillURL] = useState()

  const HierarchyProgress = useSelector(state => state.UtilityMDMSHierarchyProgressReducer.responseData)
  const selected_month = useSelector(state => state.calendarReducer.month)

  const fetchData = async params => {
    return await useJwt
      .getUserBillingHistoryMDMSModule(params)
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
    if (centeredModal || retry) {
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
          setFetchBillingHistoryData(false)
          // dispatch(handleConsumerTotalRechargesData(response.data.data.result.stat))
          setBillingHistory(response.data.data.result.stat)

          if (response.data.data.result.stat.length > 0) {
            setBillURL(response.data.data.result.stat[0].billURL)
          }
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
  }, [centeredModal, retry])

  const handleBillClicked = url => {
    setBillURL(url)
  }

  const handleModalOpenHandler = () => {
    setCenteredModal(!centeredModal)
    setFetchBillingHistoryData(true)
  }
  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }

  return (
    <>
      <StatsHorizontal
        icon={<FileText size={21} />}
        color='info'
        stats='Generated Bills'
        statTitle=''
        click={() => setCenteredModal(!centeredModal)}
        clas='h4'
        dvClas={props.dvClas ? props.dvClas : ''}
      />
      <Modal isOpen={centeredModal} toggle={() => handleModalOpenHandler(!centeredModal)} scrollable className='modal_size h-100'>
        <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>Generated bills</ModalHeader>
        {hasError ? (
          <div className='p-2'>
            <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
          </div>
        ) : (
          <>
            {fetchBillingHistory ? (
              <Loader hight='min-height-601' />
            ) : (
              <ModalBody>
                {billingHistory.length > 0 ? (
                  <Row>
                    <Col lg='4' xs='5' className='recharge-col-height'>
                      {billingHistory.map((i, index) => (
                        <Card onClick={() => handleBillClicked(i.billURL)} className='cursor-pointer' key={index}>
                          <CardBody className='px_5'>
                            <div className='d-flex justify-content-between align-items-center'>
                              <div>
                                <p className='font-weight-bolder'>Billing month: {i.billingMonth}</p>
                                {/* <p className='font-weight-bolder'>Billing date: {i.billingDate}</p>
                          <p className={`mb-0`}>Start date: {i.startDate}</p>
                          <p className='card-text mb-0'>End date: {i.endDate}</p> */}
                                <p className='card-text mb-0'>Bill number : {i.billNo}</p>
                              </div>
                              <div className={`avatar avatar-stats p-50 m-0 bg-transparent`}>
                                <Badge color='light-primary'>Rs.{i.amount}</Badge>
                              </div>
                              {/* <Button.Ripple className='btn-sm' color='primary' outline onClick={setJsonModal}>
                            XML
                          </Button.Ripple> */}
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </Col>
                    <Col lg='8' xs='7'>
                      <iframe src={billURL} title='title' className='w-100 h-100'></iframe>
                    </Col>
                  </Row>
                ) : (
                  <div className='super-center min-height-527'>
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

      <Modal isOpen={jsonModal} toggle={() => setJsonModal(!jsonModal)} scrollable className='modal-md'>
        <ModalHeader toggle={() => setJsonModal(!jsonModal)}>Raw Data of bill</ModalHeader>
        <ModalBody>XML will show here</ModalBody>
      </Modal>
    </>
  )
}

export default GeneratedBillsWrapper
