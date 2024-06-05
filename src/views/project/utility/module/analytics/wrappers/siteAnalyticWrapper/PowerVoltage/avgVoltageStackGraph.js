// ** Third Party Components
import { Line } from 'react-chartjs-2'
import { useState, useEffect } from 'react'
import useJwt from '@src/auth/jwt/useJwt'
import Loader from '@src/views/project/misc/loader'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
import authLogout from '../../../../../../../../auth/jwt/logoutlogic'
import { useDispatch } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'
import Flatpickr from 'react-flatpickr'

import { getDefaultDateRange, formattedDate } from '../../../../../../../../utility/Utils'

import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'

import { Card, CardHeader, CardTitle, CardBody, CardSubtitle, InputGroup, Col, InputGroupAddon, Button, CardImg } from 'reactstrap'
import noDataFound from '@src/assets/images/svg/noDataFound.svg'
const AvgVoltageStackGraph = ({
  labelColor,
  gridLineColor,
  warningColorShade,
  lineChartDanger,
  lineChartPrimary,
  dtrSelected,
  lineChartRed,
  lineChartYellow,
  lineChartBlue
}) => {
  // const site_id = 'S1_CLERK QUARTER_gpsbpdcl1_20200917_133412'

  // const [startDate, setStartDate] = useState('2022-06-01')
  // const [endDate, setEndDate] = useState('2022-06-30')

  const [dateRangeSelected, setDateRangeSelected] = useState(getDefaultDateRange())
  const site_id = dtrSelected.site_id

  // const [picker, setPicker] = useState(new Date())

  const [labels, setLabels] = useState([])
  const [avgVoltageRPhase, setAvgVoltageRPhase] = useState([])
  const [avgVoltageYPhase, setAvgVoltageYPhase] = useState([])
  const [avgVoltageBPhase, setAvgVoltageBPhase] = useState([])
  //   const [avgPowerData, setAvgPowerData] = useState([])
  //   const [billedEnergy, setBilledEnergy] = useState([])
  //   const [inputEnergy, setInputEnergy] = useState([])

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

  const fetchDTRAvgPowerGraphData = async params => {
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
        reportId: 3005,
        startDate: dateRangeSelected.startDate,
        endDate: dateRangeSelected.endDate,
        siteId: [site_id]
      }

      const [statusCode, response] = await fetchDTRAvgPowerGraphData(params)

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

        const temp_response = response.data.data.result
        const temp_labels = []
        const temp_avg_voltage_R_phase = []
        const temp_avg_voltage_Y_phase = []
        const temp_avg_voltage_B_phase = []
        for (let i = 0; i < temp_response.length; i++) {
          temp_labels.push(temp_response[i]['date'])
          temp_avg_voltage_R_phase.push(temp_response[i]['avg_voltage_p1'])
          temp_avg_voltage_Y_phase.push(temp_response[i]['avg_voltage_p2'])
          temp_avg_voltage_B_phase.push(temp_response[i]['avg_voltage_p3'])
        }

        setLabels(temp_labels)
        setAvgVoltageRPhase(temp_avg_voltage_R_phase)
        setAvgVoltageYPhase(temp_avg_voltage_Y_phase)
        setAvgVoltageBPhase(temp_avg_voltage_B_phase)
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
        data: avgVoltageRPhase,
        fill: false,
        tension: 0.5,
        pointRadius: 1,
        label: 'Average Voltage R-Phase(Volt)',
        pointHoverRadius: 5,
        pointStyle: 'circle',
        pointHoverBorderWidth: 5,
        borderColor: lineChartRed,
        pointBorderColor: 'transparent',
        backgroundColor: lineChartRed,
        pointHoverBackgroundColor: lineChartRed
      },
      {
        data: avgVoltageYPhase,
        fill: false,
        tension: 0.5,
        pointRadius: 1,
        label: 'Average Voltage Y-Phase(Volt)',
        pointHoverRadius: 5,
        pointStyle: 'circle',
        pointHoverBorderWidth: 5,
        borderColor: lineChartYellow,
        pointBorderColor: 'transparent',
        backgroundColor: lineChartYellow,
        pointHoverBackgroundColor: lineChartYellow
      },
      {
        data: avgVoltageBPhase,
        fill: false,
        tension: 0.5,
        pointRadius: 1,
        label: 'Average Voltage B-Phase(Volt)',
        pointHoverRadius: 5,
        pointStyle: 'circle',
        pointHoverBorderWidth: 5,
        borderColor: lineChartBlue,
        pointBorderColor: 'transparent',
        backgroundColor: lineChartBlue,
        pointHoverBackgroundColor: lineChartBlue
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
      <Card>
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
                    {`The data not found  for ${dtrSelected.site_name} from  ${dateRangeSelected.startDate} to ${dateRangeSelected.endDate} `}.
                  </p>
                </div>
              )}
            </>
          ) : (
            <Loader hight='min-height-233' />
          )}
        </CardBody>
      </Card>
    )
  }
}

export default AvgVoltageStackGraph
