import {
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Button,
  Card,
  Row,
  Col,
  CardHeader,
  CardBody,
  ListGroup,
  ListGroupItem,
  InputGroup,
  InputGroupAddon,
  CardImg
} from 'reactstrap'

// ** Third Party Components
import { Line } from 'react-chartjs-2'
import { useState, useEffect } from 'react'
import useJwt from '@src/auth/jwt/useJwt'
import Loader from '@src/views/project/misc/loader'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
// import { useLocation } from 'react-router-dom'
import authLogout from '../../../../../../../../auth/jwt/logoutlogic'
// import authLogout from '../../../../../auth/jwt/logoutlogic'
import { useDispatch } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'
import Flatpickr from 'react-flatpickr'
import noDataFound from '@src/assets/images/svg/noDataFound.svg'

import { getDefaultDateRange, formattedDate } from '../../../../../../../../utility/Utils'

import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'

const GridPerformanceTabularStats = props => {
  const [dateRangeSelected, setDateRangeSelected] = useState(getDefaultDateRange())

  // const site_id = 'S1_CLERK QUARTER_gpsbpdcl1_20200917_133412'
  const site_id = props.dtrSelected.site_id

  // const [startDate, setStartDate] = useState('2022-06-01')
  // const [endDate, setEndDate] = useState('2022-06-30')

  const [picker, setPicker] = useState(new Date())

  const [logout, setLogout] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [hasError, setError] = useState(false)
  const [retry, setRetry] = useState(true)

  const [inputEnergy, setInputEnergy] = useState(undefined)
  const [billedEnergy, setBilledEnergy] = useState(undefined)
  const [losses, setLosses] = useState(undefined)

  const [RPhaseCurrentVoltage, setRPhaseCurrentVoltage] = useState(undefined)
  const [YPhaseCurrentVoltage, setYPhaseCurrentVoltage] = useState(undefined)
  const [BPhaseCurrentVoltage, setBPhaseCurrentVoltage] = useState(undefined)

  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const retryAgain = () => {
    setError(false)
    setRetry(true)
    // setLoadCommandHistory(true)
  }

  const fetchDTRGridPerformanceStackGraphData = async params => {
    return await useJwt
      .getAnalyticsReportDTRPostRequest(params)
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
    if (retry) {
      let params = {}
      params = {
        reportId: 3001,
        startDate: dateRangeSelected.startDate,
        endDate: dateRangeSelected.endDate,
        siteId: [site_id]
      }

      const [statusCode, response] = await fetchDTRGridPerformanceStackGraphData(params)

      setRetry(false)

      if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else if (statusCode === 200) {
        // console.log('Grid Performance Tabular Data .....')
        // console.log(response.data.data.result)

        const response_temp = response.data.data.result

        if (response_temp.hasOwnProperty('currentMonth')) {
          const currentMonth_temp = response_temp.currentMonth

          if (currentMonth_temp.hasOwnProperty('inputEnergy')) {
            setInputEnergy(currentMonth_temp.inputEnergy)
          }

          if (currentMonth_temp.hasOwnProperty('billedEnergy')) {
            setBilledEnergy(currentMonth_temp.billedEnergy)
          }

          if (currentMonth_temp.hasOwnProperty('energyLoss')) {
            setLosses(currentMonth_temp.energyLoss)
          }
        }

        if (response_temp.hasOwnProperty('instantaneous')) {
          const temp = response_temp.instantaneous
          for (let i = 0; i < temp.length; i++) {
            if (temp[i]['phase'] === 'R') {
              setRPhaseCurrentVoltage(''.concat(temp[i]['current'], ' | ', temp[i]['voltage']))
            }
            if (temp[i]['phase'] === 'Y') {
              setYPhaseCurrentVoltage(''.concat(temp[i]['current'], ' | ', temp[i]['voltage']))
            }
            if (temp[i]['phase'] === 'B') {
              setBPhaseCurrentVoltage(''.concat(temp[i]['current'], ' | ', temp[i]['voltage']))
            }
          }
        }
      } else {
        setRetry(false)
        setError(true)
        setErrorMessage('Network Error, please retry')
      }
    }
  }, [retry])

  const onDateRangeSelected = val => {
    if (val && val.length >= 2) {
      const start_date = val[0]
      const end_date = val[1]
      const Difference_In_Time = end_date.getTime() - start_date.getTime()
      const difference_in_days = Difference_In_Time / (1000 * 3600 * 24)

      if (difference_in_days <= 30) {
        // setStartDateSelected(formattedDate(val[0]))
        // setEndDateSelected(formattedDate(val[1]))
        setDateRangeSelected({ endDate: formattedDate(val[1]), startDate: formattedDate(val[0]) })
      } else {
        toast.error(<Toast msg={'Date range cannot be more than 30 days'} type='danger' />, { hideProgressBar: true })
      }
      // } else {
      //   toast.error(<Toast msg={'Please select date range ....'} type='danger' />, { hideProgressBar: true })
    }
  }

  const onSubmitButtonClicked = () => {
    if (dateRangeSelected) {
      setError(false)
      setRetry(true)
    } else {
      toast.error(<Toast msg={'Please select date range ....'} type='danger' />, { hideProgressBar: true })
    }
  }

  if (hasError) {
    return (
      <div>
        <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
      </div>
    )
  }

  if (!hasError) {
    return (
      <Card>
        {!retry ? (
          <CardBody>
            <div className='d-flex justify-content-end mb-2'>
              <Col lg='5'>
                <InputGroup>
                  <Flatpickr
                    id='range-picker'
                    className='form-control'
                    onChange={onDateRangeSelected}
                    options={{ mode: 'range', dateFormat: 'Y-m-d', defaultDate: [dateRangeSelected.endDate, dateRangeSelected.startDate] }}
                  />
                  <InputGroupAddon addonType='append'>
                    <Button color='primary' outline onClick={onSubmitButtonClicked}>
                      submit
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
              </Col>
            </div>
            <>
              {inputEnergy ? (
                <Row>
                  {/* Part-1 */}
                  <Col lg='6'>
                    <CardHeader className='justify-content-center'>
                      <h4>Current Month</h4>
                    </CardHeader>
                    <ListGroup className='text-start font-weight-bolder '>
                      <ListGroupItem>
                        <Row>
                          <Col>Input Energy</Col>
                          <Col>{inputEnergy ? inputEnergy : '-'}</Col>
                        </Row>
                      </ListGroupItem>
                      <ListGroupItem>
                        <Row>
                          <Col>Billed Energy</Col>
                          <Col>{billedEnergy ? billedEnergy : '-'}</Col>
                        </Row>
                      </ListGroupItem>
                      <ListGroupItem>
                        <Row>
                          <Col>Losses</Col>
                          <Col>{losses ? losses : '-'}</Col>
                        </Row>
                      </ListGroupItem>
                    </ListGroup>
                  </Col>
                  {/* Part-2 */}
                  <Col lg='6'>
                    <CardHeader className='justify-content-center'>
                      <h4>Instantaneous</h4>
                    </CardHeader>
                    <ListGroup className=' font-weight-bolder'>
                      <ListGroupItem>
                        <Row>
                          <Col>Input Current|Voltage(R):</Col>
                          <Col>{RPhaseCurrentVoltage ? RPhaseCurrentVoltage : '-'}</Col>
                        </Row>
                      </ListGroupItem>
                      <ListGroupItem>
                        <Row>
                          <Col>Input Current|Voltage(Y):</Col>
                          <Col>{YPhaseCurrentVoltage ? YPhaseCurrentVoltage : '-'}</Col>
                        </Row>
                      </ListGroupItem>
                      <ListGroupItem>
                        <Row>
                          <Col>Input Current|Voltage(B):</Col>
                          <Col>{BPhaseCurrentVoltage ? BPhaseCurrentVoltage : '-'}</Col>
                        </Row>
                      </ListGroupItem>
                    </ListGroup>
                  </Col>
                </Row>
              ) : (
                <div className='w-100 text-center'>
                  <h2 className='mt-1 text-danger'>OOPs! NO DATA FOUND 🕵🏻‍♀️</h2>
                  <CardImg className='h-25 w-25 ' top src={noDataFound} alt='NO DATA FOUND' />
                  <p className='font-weight-bolder '>
                    {`The data not found  for ${props.dtrSelected.site_name} from  ${dateRangeSelected.startDate} to ${dateRangeSelected.endDate}  `}.
                  </p>
                </div>
              )}
            </>
          </CardBody>
        ) : (
          <Loader hight='min-height-233' />
        )}
      </Card>
    )
  }
}

export default GridPerformanceTabularStats
