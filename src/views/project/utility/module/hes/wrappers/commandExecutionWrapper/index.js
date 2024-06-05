import React, { useEffect, useState } from 'react'
// import { useSelector } from 'react-redux'
import { Button, Col, Input, Row, Label, FormGroup } from 'reactstrap'
import useJwt from '@src/auth/jwt/useJwt'

import { selectThemeColors } from '@utils'
import Select from 'react-select'

import Flatpickr from 'react-flatpickr'
import '@styles/react/libs/flatpickr/flatpickr.scss'

import Nouislider from 'nouislider-react'
import '@styles/react/libs/noui-slider/noui-slider.scss'

import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'

import moment from 'moment'

import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'

import authLogout from '../../../../../../../auth/jwt/logoutlogic'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'

const MeterCommandExecution = props => {
  const dispatch = useDispatch()
  const history = useHistory()

  // Logout User
  const [logout, setLogout] = useState(false)
  const [hasError, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [retry, setRetry] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  // console.log("Command Execution Wrapper called ....")

  // const responseData = useSelector(state => state.UtilityMdmsFlowReducer)
  const responseData = useSelector(state => state.UtilityMDASAssetListReducer)

  // console.log('Response Asset List ....')
  // console.log(responseData.responseData.dtr_list.length)

  const dlmsCommandList = useSelector(state => state.UtilityMDASDlmsCommandReducer)
  const tapCommandList = useSelector(state => state.UtilityMDASTapCommandReducer)

  // console.log('TAP Command List')
  // console.log(tapCommandList)

  const [params, setParams] = useState({})
  const [extraParams, setExtraParams] = useState({})

  const [selectedCommand, setSelectedCommand] = useState()

  // console.log('Selected Command .....')
  // console.log(selectedCommand)

  const [inputType, setInputType] = useState()
  const [datePicker, setDatePicker] = useState()
  const [valuePicker, setValuePicker] = useState('')
  const [toValue, setToValue] = useState()
  const [toTime, setToTime] = useState()
  const [rangePicker, setRangePicker] = useState([0, 0])
  const [activeCal1, setActiveCal1] = useState()
  const [activeCal2, setActiveCal2] = useState()
  const [activeCal3, setActiveCal3] = useState()
  const [activeCal4, setActiveCal4] = useState()
  const [activeCal5, setActiveCal5] = useState()
  const [activeCal6, setActiveCal6] = useState()
  const [activeCal7, setActiveCal7] = useState()
  const [activeCal8, setActiveCal8] = useState()
  const [selectiveAccess, setSelectiveAccess] = useState()
  const [isSelect, setIsSelect] = useState(true)
  const [selectedESW, setSelectedESW] = useState()

  // Use State for dtr list
  const [dtr, setDtr] = useState(undefined)
  // Use State for Meter List
  const [meterList, setMeterList] = useState(undefined)
  // Local State to maintain meter Selected
  const [meter, setMeter] = useState()
  // Local State to maintain selected DTR
  // const [dtrSelected, setDTRSelected] = useState(undefined)
  // Use State for Selected DTR List for command execution
  const [selectedDTR, setSelectedDTR] = useState([])
  // Local State to maintain total DTR Count
  const [dtrCount, setDTRCount] = useState(undefined)
  // Local State to decide whether to show DTR DropDown or Not
  const [showDTRDropDown, setShowDTRDropDown] = useState(false)
  // Local State to decide whether to show Meter Dropdown or not
  const [showMeterDropDown, setShowMeterDropDown] = useState(false)

  // Local State to store Protocols
  const [protocols, setProtocols] = useState([
    { value: 'dlms', label: 'Protocol 1' },
    { value: 'tap', label: 'Protocol 2' }
  ])

  // Local State to maintain Selected Protocol
  const [selectedProtocol, setSelectedProtocol] = useState()

  // Local State to maintain Selected Protocol Command List
  const [commandList, setCommandList] = useState([])

  // UseEffect to fetch DTR (Site) List
  const fetchMeterListForSelectedDTR = async params => {
    // API Call to fetch Meter List
    return await useJwt
      .getGISDTRMeterList(params)
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

  // UseEffect to fetch Meter List for Selected DTR from Dropdown
  useEffect(async () => {
    if (selectedDTR.length > 0 || retry) {
      const params = {
        project: props.projectName,
        site_id: selectedDTR[0]['value']
      }

      // Fetch Meter List
      const [statusCode, response] = await fetchMeterListForSelectedDTR(params)

      if (statusCode) {
        if (statusCode === 401 || statusCode === 403) {
          setLogout(true)
        } else if (statusCode === 200) {
          // Construct Meter List for DropDown
          const temp_meter_list = response.data.data.result.stat.meters

          // console.log('Meter List ....')
          // console.log(temp_meter_list)

          const meter_list = []
          for (let i = 0; i < temp_meter_list.length; i++) {
            // const temp_meter = {}
            temp_meter_list[i]['value'] = temp_meter_list[i]['meter_serial']
            temp_meter_list[i]['label'] = temp_meter_list[i]['meter_serial']
            temp_meter_list[i]['isFixed'] = 'true'
            if (temp_meter_list[i]['grid_id'] === undefined || temp_meter_list[i]['grid_id'] === '' || temp_meter_list[i]['grid_id'] === null) {
              // Don't Add Meter to dropdown
            } else if (
              temp_meter_list[i]['meter_sw_version'] === undefined ||
              temp_meter_list[i]['meter_sw_version'] === '' ||
              temp_meter_list[i]['meter_sw_version'] === null
            ) {
              // Don't Add Meter to Dropdown
            } else if (
              temp_meter_list[i]['meter_address'] === undefined ||
              temp_meter_list[i]['meter_address'] === '' ||
              temp_meter_list[i]['meter_address'] === null
            ) {
              // Don't Add Meter to Dropdown
            } else {
              meter_list.push(temp_meter_list[i])
            }
          }
          setMeterList(meter_list)
          setRetry(false)
        } else {
          setRetry(false)
          setError(true)
          setErrorMessage('Network Error, please retry')
        }
      }
    }
  }, [selectedDTR, retry])

  // If DTR Count undefined set DTR Count Value
  if (!dtrCount) {
    if (responseData.responseData.dtr_list.length > 0) {
      setDTRCount(responseData.responseData.dtr_list.length)
    }
  }

  useEffect(() => {
    // Condition to check whether to show DTR DropDown or not
    if (dtrCount && dtrCount === 1) {
      // Donot Show DTR DropDown
      setShowDTRDropDown(false)

      // Set only dtr as selected DTR
      const temp_dtr = responseData.responseData.dtr_list
      const temp = {}
      temp['value'] = temp_dtr[0]['dtr_id']
      temp['label'] = temp_dtr[0]['dtr_name']
      temp['pss_id'] = temp_dtr[0]['pss_id']
      temp['feeder_id'] = temp_dtr[0]['feeder_id']
      temp['isFixed'] = 'true'

      const temp_selected_dtr = []
      temp_selected_dtr.push(temp)
      setSelectedDTR(temp_selected_dtr)
    } else if (dtrCount && !dtr) {
      // Show DTR DropDown
      setShowDTRDropDown(true)

      const temp_dtr = []
      const dtr_list = responseData.responseData.dtr_list

      if (dtr_list.length > 0) {
        for (const ele of dtr_list) {
          const temp = {}
          temp['value'] = ele['dtr_id']
          temp['label'] = ele['dtr_name']
          temp['pss_id'] = ele['pss_id']
          temp['feeder_id'] = ele['feeder_id']
          temp['isFixed'] = 'true'
          temp_dtr.push(temp)
        }
        setDtr(temp_dtr)
      }
    }
  }, [dtrCount])

  // const [commandResponse, setCommandResponse] = useState([])

  const resetDefault = () => {
    setDatePicker()
    setRangePicker([0, 0])
    setValuePicker('')
    setToValue()
    setToTime()
    setActiveCal1()
    setActiveCal2()
    setActiveCal3()
    setActiveCal4()
    setActiveCal5()
    setActiveCal6()
    setActiveCal7()
    setActiveCal8()
    setSelectedESW()
    setSelectiveAccess(false)
  }

  const postCommandExecutionRequestDLMS = async jsonBody => {
    return await useJwt
      .postMdasDlmsCommandExecution(jsonBody)
      .then(res => {
        // console.log('Response received ....')
        // console.log(res)
        const status = res.status
        return [status, res]
      })
      .catch(err => {
        // console.log('Error Message ....')
        // console.log(err)

        if (err.response) {
          const status = err.response.status
          return [status, err]
        } else {
          return [0, err]
        }
      })
  }

  const postCommandExecutionRequestTAP = async jsonBody => {
    return await useJwt
      .postMdasTapCommandExecution(jsonBody)
      .then(res => {
        // console.log('Response received ....')
        // console.log(res)
        const status = res.status
        return [status, res]
      })
      .catch(err => {
        // console.log('Error Message ....')
        // console.log(err)

        if (err.response) {
          const status = err.response.status
          return [status, err]
        } else {
          return [0, err]
        }
      })
  }

  const submitCommmandRequest = async () => {
    // Validation procedure
    if (selectedDTR.length === 0) {
      toast.error(<Toast msg='Please select DTR.' type='danger' />, { hideProgressBar: true })
      return false
      // } else if (meter.length === 0) {
      //   toast.error(<Toast msg='Please select Meter.' type='danger' />, { hideProgressBar: true })
      //   return false
      // } else if (!selectedCommand) {
    } else if (!selectedCommand) {
      toast.error(<Toast msg='Please select command.' type='danger' />, { hideProgressBar: true })
      return false
    } else if (inputType) {
      if (inputType.includes('date') || inputType.includes('time')) {
        if (inputType === 'timeRange' || inputType === 'dateTimeRange') {
          if (selectedCommand['command_type'] === 'MR') {
            if ((!datePicker && toTime) || (datePicker && !toTime)) {
              toast.error(<Toast msg='Please select Time range.' type='danger' />, { hideProgressBar: true })
              return false
            }
          } else {
            if (!datePicker || !toTime) {
              toast.error(<Toast msg='Please select Time range.' type='danger' />, { hideProgressBar: true })
              return false
            }
          }
        } else if (!datePicker) {
          toast.error(<Toast msg='Please select Date.' type='danger' />, { hideProgressBar: true })
          return false
        }
      } else if (inputType === 'range' && !rangePicker && selectedCommand['command_type'] !== 'MR') {
        toast.error(<Toast msg='Please select input range.' type='danger' />, { hideProgressBar: true })
        return false
      } else if ((inputType === 'text' || inputType === 'number') && !valuePicker && valuePicker < 0) {
        toast.error(<Toast msg='Please insert input value.' type='danger' />, { hideProgressBar: true })
        return false
      } else if (inputType === 'numberRange' && (!valuePicker || !toValue)) {
        toast.error(<Toast msg='Please insert number range.' type='danger' />, { hideProgressBar: true })
        return false
      } else if ((inputType === 'activityCal1ph' || inputType === 'activityCal3ph') && (!activeCal1 || !activeCal2)) {
        toast.error(<Toast msg='First and second tod must be selected.' type='danger' />, { hideProgressBar: true })
        return false
      } else if ((inputType === 'select_text' || inputType === 'select_number') && !selectedESW) {
        toast.error(<Toast msg='Please select at lease one the ESW filter.' type='danger' />, { hideProgressBar: true })
        return false
      }
    }

    const [selectedMetersList, commandName] = [[], selectedCommand.value]
    let [val, mod, inpt] = ['', '', '']

    // Value according to POST payload
    if (inputType) {
      if (inputType.includes('date') || inputType.includes('time')) {
        if (inputType === 'timeRange') {
          const [from, to] = [moment(datePicker[0]).format('HH:mm:ss'), moment(toTime[0]).format('HH:mm:ss')]
          val = { from, to }
          mod = 'range'
          inpt = 'time'
        } else if (inputType === 'dateTimeRange') {
          if (selectedCommand['command_type'] === 'MR') {
            if (datePicker && toTime) {
              const [from, to] = [moment(datePicker[0]).format('YYYY-MM-DD HH:mm:ss'), moment(toTime[0]).format('YYYY-MM-DD HH:mm:ss')]
              val = { from, to }
              mod = 'range'
              inpt = 'date'
            }
          } else {
            const [from, to] = [moment(datePicker[0]).format('YYYY-MM-DD HH:mm:ss'), moment(toTime[0]).format('YYYY-MM-DD HH:mm:ss')]
            val = { from, to }
            mod = 'range'
            inpt = 'date'
          }
        } else if (datePicker) {
          const [from, to] = [moment(datePicker[0]).format('YYYY-MM-DD HH:mm:ss'), moment(datePicker[1]).format('YYYY-MM-DD HH:mm:ss')]
          val = datePicker[1] ? { from, to } : from
          mod = params.mode ? params.mode : ''
          inpt = 'date'
        }
      } else if (inputType === 'range') {
        if (selectedCommand['command_type'] === 'MR') {
          if (rangePicker) {
            val = { from: parseInt(rangePicker[0]), to: parseInt(rangePicker[1]) }
            mod = 'range'
            inpt = 'number'
          }
        } else if (rangePicker) {
          val = { from: parseInt(rangePicker[0]), to: parseInt(rangePicker[1]) }
          mod = 'range'
          inpt = 'number'
        }
      } else if (inputType === 'text' || inputType === 'number') {
        val = valuePicker
        mod = params.mode ? params.mode : ''
        inpt = inputType
      } else if (inputType === 'numberRange') {
        val = { from: parseInt(valuePicker), to: parseInt(toValue) }
        mod = 'range'
        inpt = 'number'
      } else if (inputType === 'activityCal1ph') {
        const [tod1, tod2, tod3, tod4] = [
          moment(activeCal1[0]).format('HH:mm:ss'),
          moment(activeCal2[0]).format('HH:mm:ss'),
          activeCal3 ? moment(activeCal3[0]).format('HH:mm:ss') : '-',
          activeCal4 ? moment(activeCal4[0]).format('HH:mm:ss') : '-'
        ]
        val = [tod1, tod2, tod3, tod4]
        mod = 'multi'
        inpt = 'date'
      } else if (inputType === 'activityCal3ph') {
        const [tod1, tod2, tod3, tod4, tod5, tod6, tod7, tod8] = [
          moment(activeCal1[0]).format('HH:mm:ss'),
          moment(activeCal2[0]).format('HH:mm:ss'),
          activeCal3 ? moment(activeCal3[0]).format('HH:mm:ss') : '-',
          activeCal4 ? moment(activeCal4[0]).format('HH:mm:ss') : '-',
          activeCal5 ? moment(activeCal5[0]).format('HH:mm:ss') : '-',
          activeCal6 ? moment(activeCal6[0]).format('HH:mm:ss') : '-',
          activeCal7 ? moment(activeCal7[0]).format('HH:mm:ss') : '-',
          activeCal8 ? moment(activeCal8[0]).format('HH:mm:ss') : '-'
        ]
        val = [tod1, tod2, tod3, tod4, tod5, tod6, tod7, tod8]
        mod = 'multi'
        inpt = 'date'
      } else if (inputType === 'select_text' || inputType === 'select_number') {
        if (params.isMulti) {
          const selectedVal = []
          for (const i of selectedESW) {
            selectedVal.push(i.value)
          }
          val = selectedVal
          mod = 'multi'
          inpt = inputType.split('_')[1]
        } else {
          val = selectedESW.value
          mod = ''
          inpt = inputType.split('_')[1]
        }
      }
    }

    // Create the payload
    for (let i = 0; i < selectedDTR.length; i++) {
      if (meter.length > 0) {
        for (let j = 0; j < meter.length; j++) {
          selectedMetersList.push({
            name: 'meter',
            meter_serial: meter[j]['value'],
            value: {
              pss_id: selectedDTR[i]['pss_id'],
              pss_name: meter[j]['pss_name'],
              feeder_id: selectedDTR[i]['feeder_id'],
              feeder_name: meter[j]['feeder_name'],
              site_id: selectedDTR[i]['value'],
              site_name: meter[j]['site_name'],
              meter_address: meter[j]['meter_address'],
              grid_id: meter[j]['grid_id'],
              meter_sw_version: meter[j]['meter_sw_version'],
              meter_serial: meter[j]['value'],
              protocol: selectedProtocol.value === 'dlms' ? 'dlms' : 'tap',
              project: props.projectName,
              protocol_type: selectedProtocol.value === 'dlms' ? 'dlms' : 'tap'
            },
            command: commandName,
            args: {
              value: val,
              input_type: inpt,
              mode: mod
            }
          })
        }
      } else {
        for (let j = 0; j < meterList.length; j++) {
          selectedMetersList.push({
            name: 'meter',
            meter_serial: meterList[j]['value'],
            value: {
              pss_id: selectedDTR[i]['pss_id'],
              feeder_id: selectedDTR[i]['feeder_id'],
              site_id: selectedDTR[i]['value'],
              meter_serial: meterList[j]['value'],
              protocol: selectedProtocol.value === 'dlms' ? 'dlms' : 'tap',
              project: props.projectName,
              protocol_type: selectedProtocol.value === 'dlms' ? 'dlms' : 'tap'
            },
            command: commandName,
            args: {
              value: val,
              input_type: inpt,
              mode: mod
            }
          })
        }
      }
    }

    let [statusCode, response] = [undefined, undefined]
    if (selectedProtocol.value === 'dlms') {
      // Post requst with payload
      ;[statusCode, response] = await postCommandExecutionRequestDLMS({ data: selectedMetersList })
    } else {
      // Post requst with payload
      ;[statusCode, response] = await postCommandExecutionRequestTAP({ data: selectedMetersList })
    }

    if (statusCode && statusCode === 201) {
      resetDefault()
      setSelectedCommand('')
      // setSelectedProtocol('')
      // setMeter([])
      // setSelectedDTR([])
      props.refreshCommandHistory()
      props.toggleCommandExecutionModal()
      // props.protocolSelectedForCommandExecution(selectedProtocol)
      toast.success(<Toast msg='Command sent to meter successfully.' type='success' />, { hideProgressBar: true })
    } else if (statusCode === 401 || statusCode === 403) {
      setLogout(true)
    } else {
      if (typeof response === 'string') {
        toast.error(<Toast msg={response} type='danger' />, { hideProgressBar: true })
      } else {
        toast.error(<Toast msg='Command sent to meter failed.' type='danger' />, { hideProgressBar: true })
      }
    }
  }

  useEffect(async () => {
    resetDefault()
    if (selectedCommand) {
      if (selectedCommand['command_type'] === 'MR' && selectedCommand.input_type) {
        // Check if the from time and to time exist
        if (document.getElementById('timeFrom')) {
          const from = document.getElementById('timeFrom')
          const to = document.getElementById('timeTo')

          from._flatpickr.clear()
          to._flatpickr.clear()
        }
        setSelectiveAccess(true)
        if (isSelect) {
          setInputType(selectedCommand.input_type)
          setParams(selectedCommand.params)
        } else {
          setInputType(null)
          setParams({})
        }
      } else {
        setIsSelect(false)
        setSelectiveAccess(false)
        setInputType(selectedCommand.input_type)
        setParams(selectedCommand.params)
      }
    } else {
      setInputType(null)
      setParams({})
    }
  }, [selectedCommand, isSelect])

  const timeChangeHandler = async value => {
    setDatePicker(value)
    setExtraParams({
      minDate: value[0]
    })

    const to = document.getElementById('timeTo')
    to._flatpickr.clear()
  }

  const fromNumberChangeHandler = async event => {
    try {
      if (inputType.includes('number')) {
        const { value, min, max } = event.target
        const val = Math.max(Number(min), Math.min(Number(max), Number(value)))

        setValuePicker(val)
      } else {
        setValuePicker(event.target.value)
      }
    } catch (err) {}
  }

  const toNumberChangeHandler = async event => {
    try {
      const { value, min, max } = event.target
      const val = Math.max(Number(min), Math.min(Number(max), Number(value)))

      setToValue(val)
    } catch (err) {}
  }

  // On DTR Selected
  const onDtrSelected = selectedOption => {
    // console.log("Selected DTR")
    // console.log(selectedOption)

    if (selectedOption) {
      const temp_selected_dtr = []
      temp_selected_dtr.push(selectedOption)
      setSelectedDTR(temp_selected_dtr)
      // setDTRSelected(selectedOption)
    } else {
      setSelectedDTR([])
    }
  }

  // On Meter Selected
  const onMeterSelected = selectedOption => {
    if (selectedOption.length) {
      const meter_list = []
      for (let i = 0; i < selectedOption.length; i++) {
        meter_list.push(selectedOption[i])
      }
      // const meter_list_string = meter_list.join(',')

      setMeter(meter_list)
      // setMeter('dlms')
      resetDefault()
      setInputType(null)
      setParams({})
      setSelectedCommand(null)
      // setCommandResponse(dlmsCommandResponse)
    } else {
      setMeter([])
      // setMeter(undefined)
      resetDefault()
      setInputType(null)
      setParams({})
      setSelectedCommand(null)
      // setCommandResponse([])
    }
  }

  // on Protocol Selected
  const onProtocolSelected = selectedOption => {
    if (selectedOption) {
      // console.log('Selected Protocol Value ....')
      // console.log(selectedOption.value)
      setSelectedProtocol(selectedOption)

      if (selectedOption.value === 'dlms') {
        if (dlmsCommandList.responseData.length > 0) {
          setCommandList(dlmsCommandList.responseData)
        }
      } else if (selectedOption.value === 'tap') {
        if (tapCommandList.responseData.length > 0) {
          setCommandList(tapCommandList.responseData)
        }
      }
    } else {
      setCommandList([])
      setSelectedCommand(null)
    }
  }

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }

  return (
    <div>
      <Row>
        {/* Condition to check whether to show DTR Dropdown or not */}
        {hasError ? (
          <Col lg='12'>
            <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
          </Col>
        ) : (
          !retry && (
            <>
              {showDTRDropDown && (
                <Col lg='4' xs='7' className='mb-1'>
                  <Select
                    isClearable={true}
                    onChange={onDtrSelected}
                    value={selectedDTR}
                    isSearchable
                    options={dtr}
                    className='react-select rounded zindex_1003'
                    classNamePrefix='select'
                    placeholder='Select DTR ...'
                  />
                </Col>
              )}
              <Col lg='2' xs='5' className='mb-1'>
                {/* Protocol Selection */}
                <Select
                  isClearable={true}
                  theme={selectThemeColors}
                  onChange={onProtocolSelected}
                  value={selectedProtocol}
                  options={protocols}
                  isSearchable
                  isMulti={false}
                  className='react-select border-secondary rounded'
                  classNamePrefix='select'
                  placeholder='Protocol ...'
                />
              </Col>
              <Col lg='6' xs='12' className='mb-1'>
                {/* Meter Selection */}
                <Select
                  isClearable={true}
                  theme={selectThemeColors}
                  onChange={onMeterSelected}
                  value={meter}
                  options={meterList}
                  isSearchable
                  isMulti={true}
                  className='react-select border-secondary rounded'
                  classNamePrefix='select'
                  placeholder='Select meter ...'
                />
              </Col>
              <Col lg='4' xs='6' className='mb-1'>
                {/* Command Selection */}
                <Select
                  isClearable={true}
                  onChange={setSelectedCommand}
                  options={commandList}
                  value={selectedCommand}
                  className='react-select zindex_1001'
                  classNamePrefix='select'
                  placeholder='Select command ...'
                />
              </Col>
              {selectiveAccess ? (
                <Col lg='2' xs='6' className='mb-1 pt_7 text-center'>
                  <FormGroup inline>
                    {isSelect ? (
                      <Input type='checkbox' id='basic-cb-checked' className='cursor-pointer' checked onClick={() => setIsSelect(!isSelect)} />
                    ) : (
                      <Input type='checkbox' id='basic-cb-checked' className='cursor-pointer' onClick={() => setIsSelect(!isSelect)} />
                    )}
                    <Label for='basic-cb-checked' className='font-weight-bold cursor-pointer'>
                      Selective access
                    </Label>
                  </FormGroup>
                </Col>
              ) : (
                ''
              )}
              {/* {inputType ? <Row className='border w-100 mb-2'></Row> : ''} */}
              {inputType ? (
                inputType.includes('date') || inputType.includes('time') ? (
                  inputType === 'timeRange' || inputType === 'dateTimeRange' ? (
                    <>
                      <Col xs='6' className='mb-1'>
                        <Flatpickr
                          id='timeFrom'
                          className='form-control zindex_99'
                          onClose={value => timeChangeHandler(value)}
                          placeholder='Select from range ...'
                          options={params}
                        />
                      </Col>
                      <Col xs='6' className='mb-1'>
                        <Flatpickr
                          id='timeTo'
                          className='form-control zindex_99'
                          onClose={setToTime}
                          placeholder='Select to range ...'
                          options={{ ...params, ...extraParams }}
                        />
                      </Col>
                    </>
                  ) : (
                    <Col xs='6' className='mb-1'>
                      <Flatpickr
                        id='datePicker'
                        className='form-control zindex_99'
                        onClose={setDatePicker}
                        placeholder='Select date ...'
                        options={params}
                      />
                    </Col>
                  )
                ) : inputType === 'range' ? (
                  <Col lg='4' className='mb-1 pl-2'>
                    <Nouislider
                      className='mt-2'
                      start={rangePicker}
                      connect={true}
                      step={1}
                      tooltips={true}
                      direction='ltr'
                      range={params}
                      onChange={setRangePicker}
                    />
                  </Col>
                ) : inputType === 'text' || inputType === 'number' ? (
                  <Col xs='6' className='mb-1'>
                    <Input
                      id='textInput'
                      type={inputType}
                      value={valuePicker}
                      onChange={fromNumberChangeHandler}
                      placeholder='insert the value.'
                      {...params}
                    />
                  </Col>
                ) : inputType === 'numberRange' ? (
                  <>
                    <Col xs='6' className='mb-1'>
                      <Input
                        id='numberFrom'
                        type='number'
                        value={valuePicker}
                        onChange={fromNumberChangeHandler}
                        placeholder='insert from value.'
                        {...params}
                      />
                    </Col>
                    <Col xs='6' className='mb-1'>
                      <Input
                        id='numberTo'
                        type='number'
                        value={toValue}
                        onChange={toNumberChangeHandler}
                        placeholder='insert to value.'
                        {...params}
                      />
                    </Col>
                  </>
                ) : inputType === 'activityCal1ph' ? (
                  <>
                    <Col lg='2' xs='3' className='mb-1'>
                      <Flatpickr
                        id='timeFrom'
                        className='form-control zindex_99'
                        onClose={setActiveCal1}
                        placeholder='Select tod 1 ...'
                        options={params}
                      />
                    </Col>
                    <Col lg='2' xs='3' className='mb-1'>
                      <Flatpickr
                        id='timeTo'
                        className='form-control zindex_99'
                        onClose={setActiveCal2}
                        placeholder='Select tod 2 ...'
                        options={params}
                      />
                    </Col>
                    <Col lg='2' xs='3' className='mb-1'>
                      <Flatpickr
                        id='timeTo'
                        className='form-control zindex_99'
                        onClose={setActiveCal3}
                        placeholder='Select tod 3 ...'
                        options={params}
                      />
                    </Col>
                    <Col lg='2' xs='3' className='mb-1'>
                      <Flatpickr
                        id='timeTo'
                        className='form-control zindex_99'
                        onClose={setActiveCal4}
                        placeholder='Select tod 4 ...'
                        options={params}
                      />
                    </Col>
                  </>
                ) : inputType === 'activityCal3ph' ? (
                  <>
                    <Col lg='2' xs='3' className='mb-1'>
                      <Flatpickr
                        id='timeFrom'
                        className='form-control zindex_99'
                        onClose={setActiveCal1}
                        placeholder='Select tod 1 ...'
                        options={params}
                      />
                    </Col>
                    <Col lg='2' xs='3' className='mb-1'>
                      <Flatpickr
                        id='timeTo'
                        className='form-control zindex_99'
                        onClose={setActiveCal2}
                        placeholder='Select tod 2 ...'
                        options={params}
                      />
                    </Col>
                    <Col lg='2' xs='3' className='mb-1'>
                      <Flatpickr
                        id='timeTo'
                        className='form-control zindex_99'
                        onClose={setActiveCal3}
                        placeholder='Select tod 3 ...'
                        options={params}
                      />
                    </Col>
                    <Col lg='2' xs='3' className='mb-1'>
                      <Flatpickr
                        id='timeTo'
                        className='form-control zindex_99'
                        onClose={setActiveCal4}
                        placeholder='Select tod 4 ...'
                        options={params}
                      />
                    </Col>
                    <Col lg='2' xs='3' className='mb-1'>
                      <Flatpickr
                        id='timeTo'
                        className='form-control zindex_99'
                        onClose={setActiveCal5}
                        placeholder='Select tod 5 ...'
                        options={params}
                      />
                    </Col>
                    <Col lg='2' xs='3' className='mb-1'>
                      <Flatpickr
                        id='timeTo'
                        className='form-control zindex_99'
                        onClose={setActiveCal6}
                        placeholder='Select tod 6 ...'
                        options={params}
                      />
                    </Col>
                    <Col lg='2' xs='3' className='mb-1'>
                      <Flatpickr
                        id='timeTo'
                        className='form-control zindex_99'
                        onClose={setActiveCal7}
                        placeholder='Select tod 7 ...'
                        options={params}
                      />
                    </Col>
                    <Col lg='2' xs='3' className='mb-1'>
                      <Flatpickr
                        id='timeTo'
                        className='form-control zindex_99'
                        onClose={setActiveCal8}
                        placeholder='Select tod 8 ...'
                        options={params}
                      />
                    </Col>
                  </>
                ) : inputType === 'select_text' || inputType === 'select_number' ? (
                  <Col className='mb-1'>
                    <Select
                      isClearable={true}
                      theme={selectThemeColors}
                      closeMenuOnSelect={!params.isMulti}
                      onChange={setSelectedESW}
                      options={params.options}
                      value={selectedESW}
                      isMulti={params.isMulti}
                      className='react-select zindex_100'
                      classNamePrefix='select'
                      placeholder={params.placeholder}
                    />
                  </Col>
                ) : (
                  ''
                )
              ) : (
                ''
              )}
              <Col lg='2' xs='6' className='mb-1'>
                <Button.Ripple onClick={submitCommmandRequest} type='submit' color='primary' block>
                  Apply
                </Button.Ripple>
              </Col>
            </>
          )
        )}
      </Row>
    </div>
  )
}

export default MeterCommandExecution
