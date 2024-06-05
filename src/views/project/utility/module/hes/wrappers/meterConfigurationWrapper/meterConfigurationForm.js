import { useState, useEffect } from 'react'
import { Button, Col, Row, Modal, ModalHeader, ModalBody, Input } from 'reactstrap'
import Select from 'react-select'
import CreateTable from '@src/views/ui-elements/dtTable/createTable'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import { toast } from 'react-toastify'
import useJwt from '@src/auth/jwt/useJwt'

import { useHistory } from 'react-router-dom'
import authLogout from '../../../../../../../auth/jwt/logoutlogic'

import { useDispatch, useSelector } from 'react-redux'

const MeterConfigurationForm = props => {
  const dispatch = useDispatch()
  const history = useHistory()

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const [MeterSerialNumber, setMeterSerialNumber] = useState('')
  const [SupplyType, setSupplyType] = useState('')
  const [CommunicationProtocol, setCommunicationProtocol] = useState('')
  const [PublisherTopic, setPublisherTopic] = useState('')
  const [SubscriberTopic, setSubscriberTopic] = useState('')
  const [IPAddress, setIPAddress] = useState('')
  const [Port, setPort] = useState('')
  const [SystemTitle, setSystemTitle] = useState('')
  const [AuthenticationKey, setAuthenticationKey] = useState('')
  const [EncryptionKey, setEncryptionKey] = useState('')
  const [DedicatedKey, setDedicatedKey] = useState('')
  const [ReaderPassword, setReaderPassword] = useState('')
  const [UtilitySettingPassword, setUtilitySettingPassword] = useState('')
  const [FirmwarePassword, setFirmwarePassword] = useState('')
  const [FirmwareVersion, setFirmwareVersion] = useState('')

  const [MeterConfigurationInfo, setMeterConfigurationInfo] = useState(undefined)

  const postMeterConfiguration = async jsonBody => {
    return await useJwt
      .postMDasMeterConfiguration(jsonBody)
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
    if (MeterConfigurationInfo) {
      const [statusCode, response] = await postMeterConfiguration({ ...MeterConfigurationInfo })

      if (statusCode === 201) {
        props.closeMeterConfigurationModal()
        toast.success(<Toast msg='Meter configured successfully.' type='success' />, { hideProgressBar: true })
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else {
        toast.error(<Toast msg='Meter configuration failed .' type='danger' />, { hideProgressBar: true })
      }
    }
  }, [MeterConfigurationInfo])

  const onSubmitForm = () => {
    const request_body = {}

    if (MeterSerialNumber && MeterSerialNumber !== '') {
      request_body['serial'] = MeterSerialNumber

      if (SupplyType && SupplyType !== '') {
        request_body['meter_type'] = SupplyType

        if (CommunicationProtocol && CommunicationProtocol !== '') {
          request_body['communication_protocol'] = CommunicationProtocol
          request_body['pub_topic'] = PublisherTopic
          request_body['sub_topic'] = SubscriberTopic

          if (SystemTitle && SystemTitle !== '') {
            request_body['system_title'] = SystemTitle

            if (AuthenticationKey && AuthenticationKey !== '') {
              request_body['authentication_key'] = AuthenticationKey

              if (EncryptionKey && EncryptionKey !== '') {
                request_body['encryption_key'] = EncryptionKey

                if (DedicatedKey && DedicatedKey !== '') {
                  request_body['dedicated_key'] = DedicatedKey
                  if (ReaderPassword && ReaderPassword !== '') {
                    request_body['reader_password'] = ReaderPassword

                    if (UtilitySettingPassword && UtilitySettingPassword !== '') {
                      request_body['utility_setting_password'] = UtilitySettingPassword

                      if (FirmwarePassword && FirmwarePassword !== '') {
                        request_body['firmware_password'] = FirmwarePassword

                        if (FirmwareVersion && FirmwareVersion !== '') {
                          request_body['firmware_version'] = FirmwareVersion

                          if (CommunicationProtocol === 'TCP') {
                            if (IPAddress && IPAddress !== '') {
                              request_body['ip_address'] = IPAddress
                              if (Port && Port !== '') {
                                request_body['port'] = Port
                                setMeterConfigurationInfo(request_body)
                              } else {
                                toast.error(<Toast msg='TCP Protocol requires Port Number' type='danger' />, { hideProgressBar: true })
                              }
                            } else {
                              toast.error(<Toast msg='TCP Protocol requires IP Address' type='danger' />, { hideProgressBar: true })
                            }
                          } else {
                            request_body['ip_address'] = IPAddress
                            request_body['port'] = Port
                            setMeterConfigurationInfo(request_body)
                          }
                        } else {
                          toast.error(<Toast msg='Enter Firmware Version' type='danger' />, { hideProgressBar: true })
                        }
                      } else {
                        toast.error(<Toast msg='Enter Firmware Password' type='danger' />, { hideProgressBar: true })
                      }
                    } else {
                      toast.error(<Toast msg='Enter Utility Setting password' type='danger' />, { hideProgressBar: true })
                    }
                  } else {
                    toast.error(<Toast msg='Enter Reader Password' type='danger' />, { hideProgressBar: true })
                  }
                } else {
                  toast.error(<Toast msg='Enter Dedicated key' type='danger' />, { hideProgressBar: true })
                }
              } else {
                toast.error(<Toast msg='Enter Encryption Key' type='danger' />, { hideProgressBar: true })
              }
            } else {
              toast.error(<Toast msg='Enter Authentication Key' type='danger' />, { hideProgressBar: true })
            }
          } else {
            toast.error(<Toast msg='Enter System Title' type='danger' />, { hideProgressBar: true })
          }
        } else {
          toast.error(<Toast msg='Select Communication Protocol' type='danger' />, { hideProgressBar: true })
        }
      } else {
        toast.error(<Toast msg='Select Supply Type' type='danger' />, { hideProgressBar: true })
      }
    } else {
      toast.error(<Toast msg='Enter Meter Serial Number' type='danger' />, { hideProgressBar: true })
    }
    // toast.success(<Toast msg='Meter Configured Successfully.' type='success' />, { hideProgressBar: true })
  }

  const MeterSerialNumberHandler = event => {
    setMeterSerialNumber(event.target.value)
  }

  const PublisherTopicHandler = event => {
    setPublisherTopic(event.target.value)
  }

  const SubscriberTopicHandler = event => {
    setSubscriberTopic(event.target.value)
  }

  const IPAddressHandler = event => {
    setIPAddress(event.target.value)
  }

  const PortHandler = event => {
    setPort(event.target.value)
  }

  const SystemTitleHandler = event => {
    setSystemTitle(event.target.value)
  }

  const AuthenticationKeyHandler = event => {
    setAuthenticationKey(event.target.value)
  }

  const EncryptionKeyHandler = event => {
    setEncryptionKey(event.target.value)
  }

  const DedicatedKeyHandler = event => {
    setDedicatedKey(event.target.value)
  }

  const ReaderPasswordHandler = event => {
    setReaderPassword(event.target.value)
  }

  const UtilitySettingPasswordHandler = event => {
    setUtilitySettingPassword(event.target.value)
  }

  const FirmwarePasswordHandler = event => {
    setFirmwarePassword(event.target.value)
  }

  const FirmwareVersionHandler = event => {
    setFirmwareVersion(event.target.value)
  }

  const onSupplyTypeSelected = selectedOption => {
    if (selectedOption) {
      setSupplyType(selectedOption.value)
    }
  }

  const onCommunicationProtocolSelected = selectedOption => {
    if (selectedOption) {
      setCommunicationProtocol(selectedOption.value)
    }
  }

  return (
    <Row>
      <Col md='6' className='mb-1'>
        {/* Select meter Serial number */}
        <Input
          id='serial'
          type='text'
          placeholder='Serial'
          onChange={e => {
            MeterSerialNumberHandler(e)
          }}
        />
      </Col>
      <Col md='6' className='mb-1'>
        {/* Select phase type */}
        <Select
          isClearable={true}
          closeMenuOnSelect={true}
          onChange={onSupplyTypeSelected}
          // isMulti
          options={[
            {
              label: '1-Ph',
              value: '1-Ph'
            },
            {
              label: '3-Ph',
              value: '3-Ph'
            }
          ]}
          className='react-select zindex_1000'
          classNamePrefix='select'
          placeholder='Select Supply type ...'
        />
      </Col>
      <Col md='6' className='mb-1'>
        {/* Select Protocol Type */}
        <Select
          isClearable={true}
          closeMenuOnSelect={true}
          onChange={onCommunicationProtocolSelected}
          // isMulti
          options={[
            {
              label: 'MQTT',
              value: 'MQTT'
            },
            {
              label: 'TCP',
              value: 'TCP'
            }
          ]}
          className='react-select zindex_1000'
          classNamePrefix='select'
          placeholder='Select communication     protocol ...'
        />
      </Col>
      <Col md='6' className='mb-1'>
        <Input
          id='pub_topic'
          type='text'
          placeholder='Publisher topic'
          onChange={e => {
            PublisherTopicHandler(e)
          }}
        />
      </Col>
      <Col md='6' className='mb-1'>
        <Input
          id='sub_topic'
          type='text'
          placeholder='Subscriber topic'
          onChange={e => {
            SubscriberTopicHandler(e)
          }}
        />
      </Col>
      <Col md='6' className='mb-1'>
        <Input
          id='ip_address'
          type='text'
          placeholder='IP Address'
          onChange={e => {
            IPAddressHandler(e)
          }}
        />
      </Col>
      <Col md='6' className='mb-1'>
        <Input
          id='port'
          type='text'
          placeholder='Port'
          onChange={e => {
            PortHandler(e)
          }}
        />
      </Col>
      <Col md='6' className='mb-1'>
        <Input
          id='system_title'
          type='text'
          placeholder='System title*'
          onChange={e => {
            SystemTitleHandler(e)
          }}
        />
      </Col>
      <Col md='6' className='mb-1'>
        <Input
          id='authentication_key'
          type='text'
          placeholder='Authentication key*'
          onChange={e => {
            AuthenticationKeyHandler(e)
          }}
        />
      </Col>
      <Col md='6' className='mb-1'>
        <Input
          id='encryption_key'
          type='text'
          placeholder='Encryption key*'
          onChange={e => {
            EncryptionKeyHandler(e)
          }}
        />
      </Col>
      <Col md='6' className='mb-1'>
        <Input
          id='dedicated_key'
          type='text'
          placeholder='Dedicated key*'
          onChange={e => {
            DedicatedKeyHandler(e)
          }}
        />
      </Col>
      <Col md='6' className='mb-1'>
        <Input
          id='reader_password'
          type='text'
          placeholder='Reader Password*'
          onChange={e => {
            ReaderPasswordHandler(e)
          }}
        />
      </Col>
      <Col md='6' className='mb-1'>
        <Input
          id='utility_setting_password'
          type='text'
          placeholder='Utility Setting Password*'
          onChange={e => {
            UtilitySettingPasswordHandler(e)
          }}
        />
      </Col>
      <Col md='6' className='mb-1'>
        <Input
          id='firmware_password'
          type='text'
          placeholder='Firmware Password*'
          onChange={e => {
            FirmwarePasswordHandler(e)
          }}
        />
      </Col>
      <Col md='6' className='mb-1'>
        <Input
          id='firmware_version'
          type='text'
          placeholder='Firmware Version'
          onChange={e => {
            FirmwareVersionHandler(e)
          }}
        />
      </Col>
      <Col md='12' className='mb-1 text-center'>
        <Button.Ripple color='primary' onClick={onSubmitForm}>
          Submit
        </Button.Ripple>
      </Col>
    </Row>
  )
}

export default MeterConfigurationForm
