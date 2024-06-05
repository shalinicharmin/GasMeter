import { Form, ModalFooter, Button, Col, FormGroup, Label, Input, Row, Card, Spinner } from 'reactstrap'
import { useState, useEffect } from 'react'
import Select from 'react-select'
import { useLocation } from 'react-router-dom'
import { selectThemeColors } from '@utils'
import { toast } from 'react-toastify'
import useJwt from '@src/auth/jwt/useJwt'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import { useDispatch, useSelector } from 'react-redux'
import authLogout from '../../../../../../auth/jwt/logoutlogic'
import Flatpickr from 'react-flatpickr'

// Initialize Communication Protocol Already selected in usestate
const getCommunicationProtocolInitialState = (propsRow, protocolOption) => {
  const passCommunicationProtocol = propsRow['communication_protocol']
  for (const index in protocolOption) {
    if (passCommunicationProtocol === protocolOption[index]['value']) {
      return { value: protocolOption[index]['value'], label: protocolOption[index]['value'] }
    }
  }
  return undefined
}

// Initialize BlockLoadInterval Already Selected in UseState
const getBlockLoadIntervalInitialState = (propsRow, options) => {
  const BlockloadInterval = propsRow['Blockload Interval']
  for (const index in options) {
    if (BlockloadInterval === options[index]['value']) {
      return {
        value: options[index]['value'],
        label: options[index]['label']
      }
    }
  }
  return undefined
}

// Initialize Event Push IPV6
const getEventPushIPV6 = propsRow => {
  if (propsRow['Push Event IPV6']) {
    return propsRow['Push Event IPV6']
  }
  return undefined
}

// Initialize Periodic Push IPV6
const getPeriodicPushIPV6 = propsRow => {
  if (propsRow['Periodic Push IPV6']) {
    return propsRow['Periodic Push IPV6']
  }
  return undefined
}

// Initialize Periodic Push Time
const getPeriodicPushTime = propsRow => {
  if (propsRow['Periodic Push Time']) {
    return propsRow['Periodic Push Time']
  }
  return undefined
}

const MeterConfigDataModal = props => {
  const location = useLocation()
  const uri = location.pathname.split('/')

  const ipv6_regex =
    /^(?:(?:[a-fA-F\d]{1,4}:){7}(?:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,2}|:)|(?:[a-fA-F\d]{1,4}:){4}(?:(?::[a-fA-F\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,3}|:)|(?:[a-fA-F\d]{1,4}:){3}(?:(?::[a-fA-F\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,4}|:)|(?:[a-fA-F\d]{1,4}:){2}(?:(?::[a-fA-F\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,5}|:)|(?:[a-fA-F\d]{1,4}:){1}(?:(?::[a-fA-F\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,6}|:)|(?::(?:(?::[a-fA-F\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,7}|:)))(?:%[0-9a-zA-Z]{1,})?$/gm

  const time_format_regex = /(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d)/

  const dispatch = useDispatch()
  const { onEditModal, row, setFetchingData, index } = props

  const communicationProtocolOptions = [
    { value: 'MQTT', label: 'MQTT' },
    { value: 'RF', label: 'RF' },
    { value: 'TCP', label: 'TCP' }
  ]

  const BlockLoadIntervalOptions = [
    { value: 15, label: '15 Minutes' },
    { value: 30, label: '30 Minutes' },
    { value: 60, label: '1 Hour' }
  ]

  const [communication_protocol, setCommunication_Protocol] = useState(() => getCommunicationProtocolInitialState(row, communicationProtocolOptions))
  const [blockload_interval, setBlockLoad_Interval] = useState(() => getBlockLoadIntervalInitialState(row, BlockLoadIntervalOptions))
  const [eventPushIPv6, setEventPushIpv6] = useState(getEventPushIPV6(row))
  const [periodicPushIpv6, setPeriodicPushIpv6] = useState(getPeriodicPushIPV6(row))
  const [periodicPushTime, setPeriodicPushTime] = useState(() => getPeriodicPushTime(row))

  const [disableCommunicationProtocol, setDisableCommunicationProtocol] = useState(true)
  const [disableBlockLoadInterval, setDisableBlockLoadInterval] = useState(true)
  const [disableEventPushIPV6, setDisableEventPushIPV6] = useState(true)
  const [disablePeriodicPushIPV6, setDisablePeriodicPushIPV6] = useState(true)
  const [disablePeriodicPushTime, setDisablePeriodicPushTime] = useState(true)

  const [meterMetaInformation, setMeterMetaInformation] = useState(undefined)

  const [executingCommunicationProtocol, setExecutingCommunicationProtocol] = useState(false)
  const [executingBlockLoadInterval, setExecutingBlockLoadInterval] = useState(false)
  const [executingEventPushIPV6, setExecutingEventPushIPV6] = useState(false)
  const [executingPeriodicPushIPV6, setExecutingPeriodicPushIPV6] = useState(false)
  const [executingPeriodicPushTime, setExecutingPeriodicPushTime] = useState(false)

  // console.log('Meter Meta Information ......')
  // console.log(meterMetaInformation)

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const updateCommunicationProtocol = async params => {
    return await useJwt
      .editCommunicationProtocol(params)
      .then(res => {
        // console.log('Response ....')
        // console.log(res)
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

  const executeDLMSCommand = async params => {
    return await useJwt
      .postMdasDlmsCommandExecution(params)
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

  const fetchMeterMetaData = async params => {
    return await useJwt
      .getProjectAsset(params)
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
    const params = {
      project: uri[2] === 'sbpdcl' ? 'ipcl' : uri[2],
      unique_id: row.meter_number,
      asset_type: 'meter'
    }

    const [statusCode, response] = await fetchMeterMetaData(params)

    if (statusCode === 200) {
      setMeterMetaInformation(response.data.data.result.stat.asset[0])
    } else if (statusCode === 401 || statusCode === 403) {
      setLogout(true)
    }
  }, [])

  // On Changes Functions List
  const onCommunicationProtocolChange = val => {
    // console.log(val)
    if (val) {
      setCommunication_Protocol(val)
      // setCommunication_Protocol(val.value)
    } else {
      setCommunication_Protocol(undefined)
    }
  }

  const onBlockLoadChange = val => {
    // console.log(val)
    if (val) {
      setBlockLoad_Interval(val)
    } else {
      setBlockLoad_Interval(undefined)
    }
  }

  const onEventPushIPV6Change = e => {
    // console.log(e.target.value)
    if (e.target.value) {
      setEventPushIpv6(e.target.value)
    } else {
      setEventPushIpv6(undefined)
    }
  }

  const onPeriodicPushIPV6Change = e => {
    if (e.target.value) {
      setPeriodicPushIpv6(e.target.value)
    } else {
      setPeriodicPushIpv6(undefined)
    }
  }

  const onPeriodicPushIntervalChange = e => {
    if (e) {
      setPeriodicPushTime(e[0].toLocaleTimeString('it-IT'))
    } else {
      setPeriodicPushTime(undefined)
    }
  }

  const onUpdateCommunicationProtocolClicked = async selected_communication_protocol => {
    // event.preventDefault()
    if (!communication_protocol) {
      toast.warning(<Toast msg={'select Communication Protocol.'} type='warning' />, { hideProgressBar: true })
      return false
    } else {
      let params = undefined
      params = {
        meter: row.meter_number,
        communication_protocol: selected_communication_protocol
      }
      const [status, response] = await updateCommunicationProtocol(params)

      setExecutingCommunicationProtocol(false)

      // console.log(status)
      // console.log(response)

      if (status === 200 || status === 202) {
        // onEditModal()
        // setSelectedCommunicationProtocol(undefined)
        // console.log('Protocol Updated ....')
        toast.success(<Toast msg={'command to update communication protocol sent successfully ...'} type='success' />, { hideProgressBar: true })
        // setFetchingData(true)
      } else if (status === 401 || status === 403) {
        setLogout(true)
      }
    }
  }

  const onUpdateMeterConfigurationButtonClicked = async (params, command_id) => {
    // console.log('api to be called ...')
    let [statusCode, response] = [undefined, undefined]
    ;[statusCode, response] = await executeDLMSCommand({ data: params })

    if (command_id === 2) {
      setExecutingBlockLoadInterval(false)
    } else if (command_id === 3) {
      setExecutingEventPushIPV6(false)
    } else if (command_id === 4) {
      setExecutingPeriodicPushIPV6(false)
    } else if (command_id === 5) {
      setExecutingPeriodicPushTime(false)
    }

    if (statusCode && statusCode === 201) {
      toast.success(<Toast msg='Command to update meter confiugration sent successfully.' type='success' />, { hideProgressBar: true })
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

  const onEditButtonClicked = id => {
    // id = 1 (Communication Protocol)
    // id = 2 (BlockLoad Interval)
    // id = 3 (Event Push IPV6)
    // id = 4 (Periodic Push IPV6)
    // id = 5 (Periodic Push Interval)

    if (id === 1) {
      setDisableCommunicationProtocol(false)
    } else if (id === 2) {
      setDisableBlockLoadInterval(false)
    } else if (id === 3) {
      setDisableEventPushIPV6(false)
    } else if (id === 4) {
      setDisablePeriodicPushIPV6(false)
    } else if (id === 5) {
      setDisablePeriodicPushTime(false)
    }
  }

  const createDLMSCommandDataBody = (command, args) => {
    const command_parameter = []
    command_parameter.push({
      name: 'meter',
      meter_serial: meterMetaInformation.meter_number,
      value: {
        pss_id: meterMetaInformation.pss_id,
        pss_name: meterMetaInformation.pss_name,
        feeder_id: meterMetaInformation.feeder_id,
        feeder_name: meterMetaInformation.feeder_name,
        site_id: meterMetaInformation.site_id,
        site_name: meterMetaInformation.site_name,
        meter_address: meterMetaInformation.meter_address,
        grid_id: meterMetaInformation.grid_id,
        meter_sw_version: meterMetaInformation.meter_sw_version,
        meter_serial: meterMetaInformation.meter_number,
        protocol: 'dlms',
        project: uri[2] === 'sbpdcl' ? 'ipcl' : uri[2],
        protocol_type: 'dlms'
      },
      command,
      args: {
        ...args
      }
    })
    return command_parameter
  }

  const onApplyButtonClicked = id => {
    // id = 1 (Communication Protocol)
    // id = 2 (BlockLoad Interval)
    // id = 3 (Event Push IPV6)
    // id = 4 (Periodic Push IPV6)
    // id = 5 (Periodic Push Interval)

    // console.log('ID Passed  .....')
    // console.log(id)
    if (id === 1) {
      // console.log('Type of Communication Protocol ......')
      // console.log(typeof communication_protocol)
      // console.log(communication_protocol)
      // console.log(communication_protocol instanceof String)

      if (communication_protocol) {
        setExecutingCommunicationProtocol(true)

        if (typeof communication_protocol === 'string') {
          onUpdateCommunicationProtocolClicked(communication_protocol)
        } else {
          onUpdateCommunicationProtocolClicked(communication_protocol.value)
        }
      } else {
        toast.warning(<Toast msg={'select Communication Protocol.'} type='warning' />, { hideProgressBar: true })
      }
    } else if (id === 2) {
      if (blockload_interval) {
        if (meterMetaInformation) {
          let args = {}
          if (blockload_interval instanceof Number) {
            args = {
              value: parseInt(blockload_interval) * 60,
              input_type: 'number',
              mode: ''
            }
          } else {
            args = {
              value: parseInt(blockload_interval.value) * 60,
              input_type: 'number',
              mode: ''
            }
          }
          const command = 'US_SET_PROFILE_CAPTURE_PERIOD'
          setExecutingBlockLoadInterval(true)

          onUpdateMeterConfigurationButtonClicked(createDLMSCommandDataBody(command, args), 2)
        }
      } else {
        toast.warning(<Toast msg={'select Blockload Interval.'} type='warning' />, { hideProgressBar: true })
      }
    } else if (id === 3) {
      if (eventPushIPv6) {
        if (ipv6_regex.test(eventPushIPv6)) {
          if (meterMetaInformation) {
            let args = {}
            args = {
              value: eventPushIPv6,
              input_type: 'text',
              mode: ''
            }
            const command = 'US_SET_IPV6_EVENT_PUSH'

            setExecutingEventPushIPV6(true)

            onUpdateMeterConfigurationButtonClicked(createDLMSCommandDataBody(command, args), 3)
          }
        } else {
          toast.warning(<Toast msg={'Enter valid event push ipv6'} type='warning' />, { hideProgressBar: true })
        }
      } else {
        toast.warning(<Toast msg={'Enter event push ipv6'} type='warning' />, { hideProgressBar: true })
      }
    } else if (id === 4) {
      if (periodicPushIpv6) {
        if (ipv6_regex.test(periodicPushIpv6)) {
          if (meterMetaInformation) {
            let args = {}
            args = {
              value: periodicPushIpv6,
              input_type: 'text',
              mode: ''
            }
            const command = 'US_SET_IPV6_PUSH'

            setExecutingPeriodicPushIPV6(true)

            onUpdateMeterConfigurationButtonClicked(createDLMSCommandDataBody(command, args), 4)
          }
        } else {
          toast.warning(<Toast msg={'Enter valid periodic push ipv6'} type='warning' />, { hideProgressBar: true })
        }
      } else {
        toast.warning(<Toast msg={'Enter periodic push ipv6'} type='warning' />, { hideProgressBar: true })
      }
    } else if (id === 5) {
      if (periodicPushTime) {
        if (time_format_regex.test(periodicPushTime)) {
          if (meterMetaInformation) {
            let args = {}
            args = {
              value: periodicPushTime,
              input_type: 'date',
              mode: ''
            }
            const command = 'US_SET_PERIODIC_PUSH'

            setExecutingPeriodicPushTime(true)

            onUpdateMeterConfigurationButtonClicked(createDLMSCommandDataBody(command, args), 5)
          }
        } else {
          toast.warning(<Toast msg={'select valid Periodic Push Time.'} type='warning' />, { hideProgressBar: true })
        }
      } else {
        toast.warning(<Toast msg={'select Periodic Push Time.'} type='warning' />, { hideProgressBar: true })
      }
    }
  }

  return (
    <>
      {/* <Form onSubmit={onSubmitUpdatedCommunicationProtocol}> */}
      <Card className='p-1'>
        {/* Meter Serial Number */}
        <Row>
          <Col className=''>
            <FormGroup>
              <Label for='basicInput'>Meter Serial</Label>
              <Input type='email' id='basicInput' placeholder='Meter Number' value={row.meter_number} disabled />
            </FormGroup>
          </Col>
        </Row>

        {/* select communication Protocol */}
        <Row className='mb-1'>
          <Col lg='6'>
            <Label>Communication Protocol</Label>
            <Select
              theme={selectThemeColors}
              key={`my_unique_select_key__${communication_protocol}`}
              className='react-select'
              classNamePrefix='select'
              defaultValue={communication_protocol}
              options={communicationProtocolOptions}
              name='clear'
              isDisabled={disableCommunicationProtocol}
              onChange={onCommunicationProtocolChange}
              isClearable
            />
          </Col>
          {!executingCommunicationProtocol && (
            <Col lg='6' className='mt-2 '>
              <Button onClick={() => onEditButtonClicked(1)} color='primary' type='submit' outline className='px-2'>
                Edit
              </Button>

              <Button className='mx-2 px-2' outline color='success' onClick={() => onApplyButtonClicked(1)}>
                Apply
              </Button>
            </Col>
          )}
          {executingCommunicationProtocol && (
            <Col lg='6' className='mt-2'>
              <Button.Ripple color='primary' className=' mb-0 ' outline disabled>
                <Spinner color='primary' size='sm' />
                <span className='ml-50'>Executing...</span>
              </Button.Ripple>
            </Col>
          )}
        </Row>

        {/* Select Block load */}
        <Row>
          <Col className='mb-1'>
            <Label>Block Load Interval</Label>
            <Select
              theme={selectThemeColors}
              key={`my_unique_select_key__${blockload_interval}`}
              className='react-select'
              classNamePrefix='select'
              defaultValue={blockload_interval}
              options={BlockLoadIntervalOptions}
              name='clear'
              onChange={onBlockLoadChange}
              isClearable
              isDisabled={disableBlockLoadInterval}
            />
          </Col>
          {!executingBlockLoadInterval && (
            <Col lg='6' className='mt-2'>
              <Button color='primary' type='submit' outline className='px-2' onClick={() => onEditButtonClicked(2)}>
                Edit
              </Button>

              <Button className='mx-2 px-2' outline color='success' onClick={() => onApplyButtonClicked(2)}>
                Apply
              </Button>
            </Col>
          )}

          {executingBlockLoadInterval && (
            <Col lg='6' className='mt-2'>
              <Button.Ripple color='primary' className=' mb-0 ' outline disabled>
                <Spinner color='primary' size='sm' />
                <span className='ml-50'>Executing...</span>
              </Button.Ripple>
            </Col>
          )}
        </Row>

        {/* Enter Event push */}
        <Row>
          <Col>
            <Label for='Event_Push_Pv6'>Event Push IPv6</Label>
            <Input
              type='text'
              id='Event_Push_IPv6'
              name='eventPushIPv6'
              placeholder='Event Push IPv6'
              className='mb-1'
              value={eventPushIPv6}
              disabled={disableEventPushIPV6}
              onChange={onEventPushIPV6Change}
            />
          </Col>
          {!executingEventPushIPV6 && (
            <Col lg='6' className='mt-2'>
              <Button color='primary' type='submit' outline className='px-2' onClick={() => onEditButtonClicked(3)}>
                Edit
              </Button>
              <Button className='mx-2 px-2' outline color='success' onClick={() => onApplyButtonClicked(3)}>
                Apply
              </Button>
            </Col>
          )}
          {executingEventPushIPV6 && (
            <Col lg='6' className='mt-2'>
              <Button.Ripple color='primary' className=' mb-0 ' outline disabled>
                <Spinner color='primary' size='sm' />
                <span className='ml-50'>Executing...</span>
              </Button.Ripple>
            </Col>
          )}
        </Row>

        {/* Enter Periodic Push */}
        <Row>
          <Col>
            <Label for='Periodi_Push_IPv6'>Periodic Push IPv6</Label>
            <Input
              type='text'
              id='Periodic_Push_IPv6'
              name='periodicPushIpv6'
              placeholder='Periodic Push IPv6'
              className='mb-1'
              value={periodicPushIpv6}
              disabled={disablePeriodicPushIPV6}
              onChange={onPeriodicPushIPV6Change}
            />
          </Col>
          {!executingPeriodicPushIPV6 && (
            <Col lg='6' className='mt-2'>
              <Button color='primary' type='submit' outline className='px-2' onClick={() => onEditButtonClicked(4)}>
                Edit
              </Button>
              <Button className='mx-2 px-2' outline color='success' onClick={() => onApplyButtonClicked(4)}>
                Apply
              </Button>
            </Col>
          )}

          {executingPeriodicPushIPV6 && (
            <Col lg='6' className='mt-2'>
              <Button.Ripple color='primary' className=' mb-0 ' outline disabled>
                <Spinner color='primary' size='sm' />
                <span className='ml-50'>Executing...</span>
              </Button.Ripple>
            </Col>
          )}
        </Row>

        {/* enter periodic push Time */}
        <Row>
          <Col>
            <Label for='timepicker'>Periodic Push Time</Label>
            <Flatpickr
              className='form-control mb-1'
              value={periodicPushTime}
              id='timepicker'
              options={{
                enableTime: true,
                noCalendar: true,
                dateFormat: 'H:i:S',
                allowInput: true,
                time_24hr: true,
                enableSeconds: true,
                defaultHour: 0,
                defaultMinute: 0,
                defaultSeconds: 0
              }}
              disabled={disablePeriodicPushTime}
              onChange={onPeriodicPushIntervalChange}
            />
          </Col>
          {!executingPeriodicPushTime && (
            <Col lg='6' className='mt-2'>
              <Button color='primary' type='submit' outline className='px-2' onClick={() => onEditButtonClicked(5)}>
                Edit
              </Button>

              <Button className='mx-2 px-2' outline color='success' onClick={() => onApplyButtonClicked(5)}>
                Apply
              </Button>
            </Col>
          )}
          {executingPeriodicPushTime && (
            <Col lg='6' className='mt-2'>
              <Button.Ripple color='primary' className=' mb-0 ' outline disabled>
                <Spinner color='primary' size='sm' />
                <span className='ml-50'>Executing...</span>
              </Button.Ripple>
            </Col>
          )}
        </Row>
      </Card>
      {/* </Form> */}
    </>
  )
}

export default MeterConfigDataModal
