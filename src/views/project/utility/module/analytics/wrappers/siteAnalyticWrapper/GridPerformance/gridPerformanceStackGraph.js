// ** Third Party Components
import { Line } from 'react-chartjs-2'
import { useState, useEffect } from 'react'
import useJwt from '@src/auth/jwt/useJwt'
import Loader from '@src/views/project/misc/loader'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
import authLogout from '../../../../../../../../auth/jwt/logoutlogic'
import { useDispatch } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'
import noDataFound from '@src/assets/images/svg/noDataFound.svg'
import Flatpickr from 'react-flatpickr'

// ** Reactstrap Imports
import {
  Card,
  CardHeader,
  CardTitle,
  InputGroup,
  InputGroupAddon,
  Input,
  CardBody,
  CardSubtitle,
  Col,
  Row,
  CardImg,
  CardText,
  Button
} from 'reactstrap'

import { getDefaultDateRange, formattedDate } from '../../../../../../../../utility/Utils'

import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'

const GridPerformanceStackGraph = ({ labelColor, gridLineColor, warningColorShade, lineChartDanger, lineChartPrimary, dtrSelected }) => {
  // console.log('DTR Selected ....')
  // console.log(dtrSelected)

  const site_id = dtrSelected.site_id
  // const site_id = 'S1_CLERK QUARTER_gpsbpdcl1_20200917_133412'

  // const [startDate, setStartDate] = useState('2022-06-01')
  // const [endDate, setEndDate] = useState('2022-06-30')

  const [dateRangeSelected, setDateRangeSelected] = useState(getDefaultDateRange())

  const [labels, setLabels] = useState([])
  const [billedEnergy, setBilledEnergy] = useState([])
  const [inputEnergy, setInputEnergy] = useState([])

  const [picker, setPicker] = useState(new Date())

  const [logout, setLogout] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [hasError, setError] = useState(false)
  const [retry, setRetry] = useState(true)

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
        reportId: 3002,
        startDate: dateRangeSelected.startDate,
        endDate: dateRangeSelected.endDate,
        siteId: [site_id]
      }

      const [statusCode, response] = await fetchDTRGridPerformanceStackGraphData(params)

      setRetry(false)

      if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else if (statusCode === 200) {
        // Set Total Row Count
        // setTotalCount(response.data.data.result.data.length)
        // Set Response Data
        // setResponse(response.data.data.result.data)
        // console.log('Grid Performance Stack Graph Data .....')
        // console.log(response.data.data.result.dayWiseEnergy)

        const temp_response = response.data.data.result.dayWiseEnergy
        const temp_labels = []
        const temp_input_energy = []
        const temp_billed_energy = []
        for (let i = 0; i < temp_response.length; i++) {
          temp_labels.push(temp_response[i]['date'])
          temp_input_energy.push(temp_response[i]['input_power'])
          temp_billed_energy.push(temp_response[i]['billed_power'])
        }

        setLabels(temp_labels)
        setBilledEnergy(temp_billed_energy)
        setInputEnergy(temp_input_energy)
      } else {
        setRetry(false)
        setError(true)
        setErrorMessage('Network Error, please retry')
      }
    }
  }, [retry])

  // ** Chart Options
  const options = {
    responsive: true,
    backgroundColor: false,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: labelColor },
        grid: {
          borderColor: gridLineColor,
          color: gridLineColor
        }
      },
      y: {
        // min: 0,
        // max: 400,
        scaleLabel: { display: true },
        ticks: {
          stepSize: 100,
          color: labelColor
        },
        grid: {
          borderColor: gridLineColor,
          color: gridLineColor
        }
      }
    },
    plugins: {
      legend: {
        align: 'start',
        position: 'top',
        labels: {
          boxWidth: 10,
          marginBottom: 25,
          color: labelColor,
          usePointStyle: true
        }
      }
    }
  }

  //** To add spacing between legends and chart
  const plugins = [
    {
      beforeInit(chart) {
        chart.legend.afterFit = function () {
          this.height += 20
        }
      }
    }
  ]

  // ** Chart Data
  const data = {
    labels,
    datasets: [
      {
        data: billedEnergy,
        fill: false,
        tension: 0.5,
        pointRadius: 1,
        label: 'Billed Energy(kWh)',
        pointHoverRadius: 5,
        pointStyle: 'circle',
        pointHoverBorderWidth: 5,
        borderColor: lineChartDanger,
        pointBorderColor: 'transparent',
        backgroundColor: lineChartDanger,
        pointHoverBackgroundColor: lineChartDanger
      },
      {
        data: inputEnergy,
        fill: false,
        tension: 0.5,
        label: 'Input Energy(kWh)',
        pointRadius: 1,
        pointHoverRadius: 5,
        pointStyle: 'circle',
        pointHoverBorderWidth: 5,
        borderColor: lineChartPrimary,
        pointBorderColor: 'transparent',
        backgroundColor: lineChartPrimary,
        pointHoverBackgroundColor: lineChartPrimary
      }
    ]
  }

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
      <>
        <Card>
          <CardBody>
            {/* Date button */}
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
            {!retry ? (
              <>
                {labels.length > 0 ? (
                  <div style={{ height: '300px' }}>
                    <Line data={data} options={options} height={450} plugins={plugins} />
                  </div>
                ) : (
                  <div className='w-100 text-center'>
                    <h2 className='mt-1 text-danger'>OOPs! NO DATA FOUND 🕵🏻‍♀️</h2>
                    <CardImg className='h-25 w-25 ' top src={noDataFound} alt='NO DATA FOUND' />
                    <p className='font-weight-bolder'>
                      {`The data not found  for ${dtrSelected.site_name} from  ${dateRangeSelected.startDate} to ${dateRangeSelected.endDate}  `}.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <Loader hight='min-height-233' />
            )}
          </CardBody>
        </Card>
      </>
    )
  }
}

export default GridPerformanceStackGraph
