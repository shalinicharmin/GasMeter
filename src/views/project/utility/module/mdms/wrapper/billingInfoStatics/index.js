import classnames from 'classnames'
import Avatar from '@components/avatar'
import { Card, CardHeader, CardTitle, CardBody, CardText, Row, Col, Media } from 'reactstrap'
import IcoFun from '@src/utility/dynamicIcon'
// import { useSelector } from 'react-redux'
import { useContext, useState, useEffect } from 'react'
import Loader from '@src/views/project/misc/loader'
import useJwt from '@src/auth/jwt/useJwt'

import { useLocation, useHistory } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import authLogout from '../../../../../../../auth/jwt/logoutlogic'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'

const BillingOperationStatic = props => {
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

  const iconStore = useSelector(state => state.iconsStore)
  const [callAPI, setCallAPI] = useState(true)
  const [APIResponse, setAPIResponse] = useState([])
  const HierarchyProgress = useSelector(state => state.UtilityMDMSHierarchyProgressReducer.responseData)
  const selected_month = useSelector(state => state.calendarReducer.month)

  const fetchData = async params => {
    return await useJwt
      .getAssetWiseBillDistributionAnalyticsMDMSModule(params)
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
    if (callAPI || retry) {
      if (props.hierarchy === 'pss') {
        const params = {
          project: HierarchyProgress.project_name,
          year: selected_month.year,
          month: selected_month.month
        }

        const [statusCode, response] = await fetchData(params)

        setCallAPI(false)
        if (statusCode === 200) {
          try {
            setAPIResponse(response.data.data.result.stat)
            // dispatch(handlePssData(response.data.data.result.stat))
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

        setCallAPI(false)
        if (statusCode === 200) {
          try {
            setAPIResponse(response.data.data.result.stat)
            setRetry(false)
          } catch (error) {
            setRetry(false)
            setError(true)
            setErrorMessage('Something went wrong, please retry')
          }
          // dispatch(handleFeederData(response.data.data.result.stat))
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

        setCallAPI(false)
        if (statusCode === 200) {
          try {
            setAPIResponse(response.data.data.result.stat)
            setRetry(false)
          } catch (error) {
            setRetry(false)
            setError(true)
            setErrorMessage('Something went wrong, please retry')
          }
          // dispatch(handleDtrData(response.data.data.result.stat))
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

        setCallAPI(false)
        if (statusCode === 200) {
          try {
            setAPIResponse(response.data.data.result.stat)
            setRetry(false)
          } catch (error) {
            setRetry(false)
            setError(true)
            setErrorMessage('Something went wrong, please retry')
          }
          // dispatch(handleUserData(response.data.data.result.stat))
        } else if (statusCode === 401 || statusCode === 403) {
          setLogout(true)
        } else {
          setRetry(false)
          setError(true)
          setErrorMessage('Network Error, please retry')
        }
      }
    }
  }, [callAPI, retry])

  const renderData = () => {
    return APIResponse.map((item, index) => {
      const margin = Object.keys(props.cols)
      return (
        <Col
          key={index}
          {...props.cols}
          className={classnames({
            [`mb-2 mb-${margin[0]}-0`]: index !== APIResponse.length - 1
          })}>
          <Media className={APIResponse.length - 1 === index ? 'my-1' : 'my-1 border-right'}>
            <Avatar
              color={iconStore.colors[Math.floor(Math.random() * iconStore.colors.length)]}
              icon={IcoFun(iconStore.icons[Math.floor(Math.random() * iconStore.icons.length)], 24)}
              className='mr-2'
            />
            <Media className='my-auto' body>
              <h4 className='font-weight-bolder mb-0'>{item.value}</h4>
              <CardText className='font-small-3'>{item.title}</CardText>
              {/* <h4 className='text-right m-0 mr-2'>&#8594;</h4> */}
              {/* <div>
                <a>
                  <span className='float-left'> {IcoFun('Download', 17)}</span>
                  <span className='border-right'> &nbsp; CSV &nbsp; &nbsp; </span>
                </a>
                <span className='border-left'>
                  {' '}
                  &nbsp; &nbsp; {item.info_title} : {item.info_value}{' '}
                </span>
              </div> */}
            </Media>
          </Media>
        </Col>
      )
    })
  }

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }

  return (
    <Card className='card-statistics'>
      {/* <CardHeader className='border-bottom p-1'>
        <CardTitle tag='h4'>Billing Info</CardTitle>
      </CardHeader> */}
      <CardBody className='p-2'>
        {hasError ? (
          <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
        ) : (
          <>
            {!callAPI && !retry && <Row>{renderData()}</Row>}
            {(callAPI || retry) && <Loader hight='min-height-158' />}
          </>
        )}
      </CardBody>
    </Card>
  )
}

export default BillingOperationStatic
