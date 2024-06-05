import StatsVertical from '@components/widgets/stats/StatsVertical'
// String to icon tag
import IcoFun from '@src/utility/dynamicIcon'

import { ThemeColors } from '@src/utility/context/ThemeColors'
import { useContext, useState, useEffect } from 'react'
import { Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap'

import { useSelector, useDispatch } from 'react-redux'

import { handleBillsGeneratedData as handlePssData } from '@store/actions/UtilityProject/MDMS/pss'
import { handleBillsGeneratedData as handleFeederData } from '@store/actions/UtilityProject/MDMS/feeder'
import { handleBillsGeneratedData as handleDtrData } from '@store/actions/UtilityProject/MDMS/dtr'
import { handleBillsGeneratedData as handleUserData } from '@store/actions/UtilityProject/MDMS/user'

import BillingOperationStatic from '@src/views/project/utility/module/mdms/wrapper/billingInfoStatics'
import BillDistributionWrapper from '@src/views/project/utility/module/mdms/wrapper/vendorWiseDistributionWrapper'

import Loader from '@src/views/project/misc/loader'
import useJwt from '@src/auth/jwt/useJwt'
import { useLocation, useHistory } from 'react-router-dom'
import authLogout from '../../../../../../auth/jwt/logoutlogic'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'

const BillsGeneratedWrapper = props => {
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
  const [centeredModal, setCenteredModal] = useState(false)

  let response, callAPI, responseData

  if (props.hierarchy === 'pss') {
    response = useSelector(state => state.UtilityMdmsPssBillsGeneratedReducer)
  } else if (props.hierarchy === 'feeder') {
    response = useSelector(state => state.UtilityMdmsFeederBillsGeneratedReducer)
  } else if (props.hierarchy === 'dtr') {
    response = useSelector(state => state.UtilityMdmsDtrBillsGeneratedReducer)
  } else if (props.hierarchy === 'user') {
    response = useSelector(state => state.UtilityMdmsUserBillsGeneratedReducer)
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
      .getHierarchyWiseBillsGeneratedMDMSModule(params)
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
      //   title: 'Total Bills Generated',
      //   statistics: '75000',
      //   series: [
      //     {
      //       data: [0, 20, 5, 30, 15, 45]
      //     }
      //   ]
      // }

      //Call API and check response and dispatch
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
            setRetry(false)
            setError(false)
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
            setError(false)
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
            setError(false)
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

        if (statusCode === 200) {
          try {
            dispatch(handleUserData(response.data.data.result.stat))
            setRetry(false)
            setError(false)
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
    <Col>
      <StatsVertical
        icon={IcoFun('TrendingUp', 21)}
        color='info'
        stats={responseData[0].value}
        statTitle={responseData[0].title}
        click={() => setCenteredModal(!centeredModal)}
      />
      <Modal isOpen={centeredModal} toggle={() => setCenteredModal(!centeredModal)} className='modal-dialog-centered modal_size'>
        <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>Billing Info</ModalHeader>
        <ModalBody>
          <Row className='justify-content-end'>
            <Col>
              <BillingOperationStatic cols={props.cols ? props.cols : { xl: '3', sm: '6' }} hierarchy={props.hierarchy} />
            </Col>
          </Row>
          <Row className='justify-content-end'>
            <Col>
              <BillDistributionWrapper
                statehandler=''
                tableName={`${props.hierarchy.charAt(0).toUpperCase() + props.hierarchy.substr(1).toLowerCase()} wise bill distribution status`}
                hierarchy={props.hierarchy}
              />
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    </Col>
  )

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }
  return (
    <Col sm='6' className='match-height px-0'>
      {hasError ? (
        <div className='px-1'>
          <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
        </div>
      ) : (
        <>
          {response && !response.callAPI && !retry && content_card}
          {(!response || response.callAPI || retry) && <Loader hight='min-height-158' />}
        </>
      )}
    </Col>
  )
}

export default BillsGeneratedWrapper
