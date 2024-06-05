// ** Custom Hooks
import { useSkin } from '@hooks/useSkin'
import { Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import { useContext, useState, useEffect } from 'react'
import BarChart from './chart/chartjsBarChart'
import LineChart from './chart/chartjsLineChart'

import Loader from '@src/views/project/misc/loader'

import useJwt from '@src/auth/jwt/useJwt'

import { useSelector, useDispatch } from 'react-redux'

import Flatpickr from 'react-flatpickr'
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect'
import 'flatpickr/dist/plugins/monthSelect/style.css'
import '@styles/react/libs/flatpickr/flatpickr.scss'

import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'

import moment from 'moment'

import Select from 'react-select'
import makeAnimated from 'react-select/animated'
import { selectThemeColors } from '@utils'
import no_data from '@src/assets/images/svg/no_data.svg'

import { useLocation, useHistory } from 'react-router-dom'
import authLogout from '../../../../../../../../auth/jwt/logoutlogic'

const GraphModalWrapper = props => {
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

  const animatedComponents = makeAnimated()

  const selected_month = useSelector(state => state.calendarReducer.month)
  const HierarchyProgress = useSelector(state => state.UtilityMDMSHierarchyProgressReducer.responseData)

  const [DailyData, setDailyData] = useState(undefined)
  const [HourlyData, setHourlyData] = useState(undefined)

  // Local State for selected month field
  const [date, setDate] = useState()
  const [SelectedMonth, setSelectedMonth] = useState(selected_month.month)
  const [SelectedYear, setSelectedYear] = useState(selected_month.year)
  const [fetchDailyData, setFetchDailyData] = useState(true)

  // Local State for date range selection
  const [startDateTime, setStartDateTime] = useState(undefined)
  const [endDateTime, setEndDateTime] = useState(undefined)
  const [fetchHourlyData, setFetchHourlyData] = useState(true)

  // Required Params for graph
  const [title, setTitle] = useState(undefined)
  const [type, setType] = useState(undefined)
  const [label, setLabel] = useState(undefined)
  const [unitType, setUnitType] = useState(undefined)
  const [SelectedGraphType, SetSelectedGraphType] = useState(undefined)

  if (!SelectedGraphType) {
    SetSelectedGraphType(props.params)
    setTitle(props.title)
    setType(props.type)
    setLabel(props.label)
    setUnitType(props.unitType)
  }

  const [GraphOptions, SetGraphOptions] = useState(undefined)
  if (!GraphOptions) {
    const graph_type_list = [
      {
        value: 'POWER',
        label: 'Power(Watt)',
        isFixed: 'true'
      },
      // {
      //   value: 'MD',
      //   label: 'Maximum Demand',
      //   isFixed: 'true'
      // },
      {
        value: 'PF',
        label: 'Power Factor',
        isFixed: 'true'
      },
      {
        value: 'KVAH',
        label: 'Apparent Energy(kVAh)',
        isFixed: 'true'
      },
      {
        value: 'KVARH',
        label: 'Reactive Energy(kVArh)',
        isFixed: 'true'
      },
      {
        value: 'KWH',
        label: 'Active Energy(kWh)',
        isFixed: 'true'
      }
    ]

    SetGraphOptions(graph_type_list)
  }

  if (date) {
    setSelectedMonth(date.split('-')[1])
    setSelectedYear(date.split('-')[0])
    setFetchDailyData(true)
    setDate(undefined)
  }

  const [getSelectedMonth, SetgetSelectedMonth] = useState('')

  const current_date = moment()
  const _current_month = ''.concat(
    current_date.year(),
    '-',
    (current_date.month() + 1).toString().length > 1 ? current_date.month() + 1 : '0'.concat(current_date.month() + 1)
  )

  useEffect(() => {
    SetgetSelectedMonth(_current_month)
  }, [])

  const handleMonthChange = e => {
    SetgetSelectedMonth(e.target.value)
    setDate(e.target.value)
  }

  // ** Theme Colors
  const { colors } = useContext(ThemeColors),
    [skin, setSkin] = useSkin(),
    labelColor = skin === 'dark' ? '#b4b7bd' : '#6e6b7b',
    tooltipShadow = 'rgba(0, 0, 0, 0.25)',
    gridLineColor = 'rgba(200, 200, 200, 0.2)',
    lineChartPrimary = '#666ee8',
    lineChartDanger = '#ff4961',
    warningColorShade = '#ffe802',
    warningLightColor = '#FDAC34',
    successColorShade = '#28dac6',
    primaryColorShade = '#836AF9',
    infoColorShade = '#299AFF',
    yellowColor = '#ffe800',
    greyColor = '#4F5D70',
    blueColor = '#2c9aff',
    blueLightColor = '#84D0FF',
    greyLightColor = '#EDF1F4'

  const fetchDataDaily = async params => {
    return await useJwt
      .getUserAnalyticalInformationDailyMDMSModule(params)
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

  // UseEffect to fetch Selected Month Data
  useEffect(async () => {
    if (fetchDailyData || retry) {
      if (SelectedGraphType === 'POWER' || SelectedGraphType === 'MD' || SelectedGraphType === 'PF') {
        if (startDateTime && endDateTime) {
          const params = {
            project: HierarchyProgress.project_name,
            start_date: startDateTime,
            end_date: endDateTime,
            sc_no: HierarchyProgress.user_name,
            graph_type: SelectedGraphType
          }
          const [statusCode, response] = await fetchDataDaily(params)
          if (statusCode) {
            if (statusCode === 200) {
              setFetchDailyData(false)
              setDailyData(response.data.data.result.stat)
              setRetry(false)
            } else if (statusCode === 401 || statusCode === 403) {
              setLogout(true)
            } else {
              setRetry(false)
              setError(true)
              setErrorMessage('Network Error, please retry')
            }
          }
        } else {
          const current_time = new Date()
          const start_time_temp = ''.concat(
            current_time.getFullYear(),
            '-',
            (current_time.getMonth() + 1).toString().padStart(2, '0'),
            '-',
            current_time.getDate().toString().padStart(2, '0'),
            ' ',
            '00:00:00'
          )
          const end_time_temp = ''.concat(
            current_time.getFullYear(),
            '-',
            (current_time.getMonth() + 1).toString().padStart(2, '0'),
            '-',
            current_time.getDate().toString().padStart(2, '0'),
            ' ',
            '23:59:59'
          )

          const params = {
            project: HierarchyProgress.project_name,
            start_date: start_time_temp,
            end_date: end_time_temp,
            sc_no: HierarchyProgress.user_name,
            graph_type: SelectedGraphType
          }
          const [statusCode, response] = await fetchDataDaily(params)
          if (statusCode) {
            if (statusCode === 200) {
              setFetchDailyData(false)
              setDailyData(response.data.data.result.stat)
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
      } else {
        const params = {
          project: HierarchyProgress.project_name,
          year: SelectedYear,
          month: SelectedMonth,
          sc_no: HierarchyProgress.user_name,
          graph_type: SelectedGraphType
        }
        const [statusCode, response] = await fetchDataDaily(params)
        if (statusCode) {
          if (statusCode === 200) {
            setFetchDailyData(false)
            setDailyData(response.data.data.result.stat)
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
    }
  }, [fetchDailyData, retry])

  // Use Effect to fetch selected Day Hourly Consumption
  // useEffect(() => {
  //   if (fetchHourlyData) {
  //     setHourlyData(props.dayData)
  //     setFetchHourlyData(false)
  //   }
  // }, [fetchHourlyData])

  //Extract Label and Value for Graphs
  const barGraphValues = []
  const barGraphLabels = []

  const lineGraphvalues = []
  const lineGraphLabels = []

  // Inflate Data into Bar Graph
  if (!fetchDailyData && DailyData && DailyData.length > 0) {
    DailyData.forEach(function (obj) {
      barGraphLabels.push(obj.x)
      barGraphValues.push(obj.y)
    })
  }

  //Iterate over line graph data
  // setHourlyData(props.dayData)
  if (!fetchHourlyData && HourlyData && HourlyData.length > 0) {
    HourlyData.forEach(function (obj) {
      lineGraphLabels.push(obj.hour)
      lineGraphvalues.push(obj.consumption)
    })
  }

  const barChartClickHandler = index => {
    setFetchHourlyData(true)
  }

  const onGraphTypeSelected = selectedOption => {
    SetSelectedGraphType(selectedOption['value'])
    // setTitle(selectedOption['label'])
    setType(selectedOption['label'])
    setLabel(selectedOption['label'])

    if (selectedOption['value'] === 'MD') {
      setUnitType('Watt')
    } else if (selectedOption['value'] === 'KWH') {
      setUnitType('kWh')
    } else if (selectedOption['value'] === 'KVAH') {
      setUnitType('kVAh')
    } else if (selectedOption['value'] === 'KVARH') {
      setUnitType('kVArh')
    } else if (selectedOption['value'] === 'PF') {
      setUnitType('')
    } else if (selectedOption['value'] === 'POWER') {
      setUnitType('Watt')
    }

    if (selectedOption['label'] === 'kWh') {
      setTitle('Day to Day Consumption in kWh')
    } else {
      setTitle('')
    }

    setFetchDailyData(true)
    setStartDateTime(undefined)
    setEndDateTime(undefined)
  }

  const dateTimeFormat = (inputDate, temp_time) => {
    return ''.concat(
      inputDate.getFullYear(),
      '-',
      (inputDate.getMonth() + 1).toString().padStart(2, '0'),
      '-',
      inputDate.getDate().toString().padStart(2, '0'),
      ' ',
      temp_time
    )
  }

  const onDateSelected = value => {
    const startDate = dateTimeFormat(value[0], '00:00:00')
    const endDate = dateTimeFormat(value[0], '23:59:59')

    setStartDateTime(startDate)
    setEndDateTime(endDate)
    setFetchDailyData(true)
  }
  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }

  if (SelectedGraphType === 'POWER' || SelectedGraphType === 'MD' || SelectedGraphType === 'PF') {
    let Title = ''
    if (startDateTime && endDateTime) {
      Title = ''.concat(startDateTime, ' to ', endDateTime, ' ', type, ' graph for consumer : ', HierarchyProgress.meter_serial_number)
    } else {
      Title = 'Current Day '.concat(type, ' graph for consumer : ', HierarchyProgress.meter_serial_number)
    }

    return (
      <Modal isOpen={props.isOpen} toggle={() => props.handleCenterModalState(!props.isOpen)} scrollable className='modal_size'>
        <ModalHeader toggle={() => props.handleCenterModalState(!props.isOpen)}>{Title}</ModalHeader>
        <ModalBody>
          {fetchDailyData && <Loader hight='min-height-527' />}
          {!fetchDailyData && (
            <Col sm='12'>
              <Row className='mb-1'>
                <Col sm='4'>
                  <Select
                    isClearable={true}
                    theme={selectThemeColors}
                    closeMenuOnSelect={true}
                    components={animatedComponents}
                    onChange={onGraphTypeSelected}
                    isSearchable
                    options={GraphOptions}
                    className='react-select border-secondary rounded'
                    classNamePrefix='select'
                    placeholder='Select Graph Type ...'
                  />
                </Col>
                <Col sm='4'></Col>
                <Col sm='4'>
                  {/* <Flatpickr
                    value={new Date(SelectedYear, SelectedMonth - 1, 1, 0, 0, 0, 0)} // to get value in month and year use moment(date[0]).format('YYYY-MM')
                    className='form-control zindex_99'
                    onChange={value => setDate(value)}
                    placeholder='Select month ...'
                    options={{
                      plugins: [
                        new monthSelectPlugin({
                          shorthand: true,
                          dateFormat: 'F Y',
                          altFormat: 'F Y',
                          theme: 'light'
                        })
                      ]
                    }}
                  /> */}
                  <Flatpickr
                    placeholder='Select date ...'
                    onChange={onDateSelected}
                    className='form-control'
                    options={{ mode: 'single', enableTime: false }}
                  />
                </Col>
              </Row>

              {hasError ? (
                <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
              ) : (
                <>
                  {DailyData.length > 0 ? (
                    <LineChart
                      type={type}
                      warningColorShade={warningColorShade}
                      lineChartDanger={lineChartDanger}
                      lineChartPrimary={lineChartPrimary}
                      labelColor={labelColor}
                      tooltipShadow={tooltipShadow}
                      gridLineColor={gridLineColor}
                      labels={barGraphLabels}
                      values={barGraphValues}
                      height={400}
                      unitType={unitType}
                      title={title}
                    />
                  ) : (
                    <div className='super-center min-height-527'>
                      <div>
                        <img src={no_data} style={{ height: '150px', width: '150px' }} />
                        <p className='mt-1 ml-3'>No data found</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Col>
          )}
        </ModalBody>
      </Modal>
    )
  }

  const Title = 'Selected Month '.concat(type, ' graph for consumer : ', HierarchyProgress.meter_serial_number)
  return (
    <Modal isOpen={props.isOpen} toggle={() => props.handleCenterModalState(!props.isOpen)} scrollable className='modal_size'>
      <ModalHeader toggle={() => props.handleCenterModalState(!props.isOpen)}>{Title}</ModalHeader>
      <ModalBody>
        {fetchDailyData && <Loader hight='min-height-517' />}
        {!fetchDailyData && (
          <Col sm='12'>
            <Row className='mb-1'>
              <Col sm='4'>
                <Select
                  isClearable={true}
                  theme={selectThemeColors}
                  closeMenuOnSelect={true}
                  components={animatedComponents}
                  onChange={onGraphTypeSelected}
                  isSearchable
                  options={GraphOptions}
                  className='react-select border-secondary rounded'
                  classNamePrefix='select'
                  placeholder='Select Graph Type ...'
                />
              </Col>
              <Col sm='4'></Col>
              <Col sm='4'>
                <input type='month' min='2018-01' value={getSelectedMonth} onChange={e => handleMonthChange(e)} />
                {/* <Flatpickr
                  value={new Date(SelectedYear, SelectedMonth - 1, 1, 0, 0, 0, 0)} // to get value in month and year use moment(date[0]).format('YYYY-MM')
                  className='form-control zindex_99'
                  onChange={value => setDate(value)}
                  placeholder='Select month ...'
                  options={{
                    plugins: [
                      new monthSelectPlugin({
                        shorthand: true,
                        dateFormat: 'F Y',
                        altFormat: 'F Y',
                        theme: 'light'
                      })
                    ]
                  }}
                /> */}
              </Col>
            </Row>
            {hasError ? (
              <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
            ) : (
              <>
                {DailyData && DailyData.length > 0 ? (
                  <BarChart
                    type={type}
                    warningColorShade={warningColorShade}
                    lineChartDanger={lineChartDanger}
                    lineChartPrimary={lineChartPrimary}
                    labelColor={labelColor}
                    successColorShade={primaryColorShade}
                    tooltipShadow={tooltipShadow}
                    gridLineColor={gridLineColor}
                    labels={barGraphLabels}
                    values={barGraphValues}
                    height={400}
                    label={label}
                    unitType={unitType}
                    barChartClickHandler={barChartClickHandler}
                    title={title}
                  />
                ) : (
                  <div className='super-center min-height-527'>
                    <div>
                      <img src={no_data} style={{ height: '150px', width: '150px' }} />
                      <p className='mt-1 ml-3'>No data found</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </Col>
        )}
      </ModalBody>
    </Modal>
  )
}

export default GraphModalWrapper
