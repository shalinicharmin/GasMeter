import { useState } from 'react'
import { Button, Col, Row, Modal, ModalHeader, ModalBody, Input } from 'reactstrap'
import MeterConfigurationForm from './meterConfigurationWrapper/meterConfigurationForm'
import ConfiguredMeterList from './meterConfigurationWrapper/configuredMeterList'

const MeterConfiguration = props => {
  const [meterConfigModal, setMeterConfigModal] = useState(false)
  const [meterConfigListModal, setMeterConfigListModal] = useState(false)

  const formFields = {
    'text#serial': ['Serial*'],
    'select#meter_type': [
      'Select meter type',
      [
        {
          label: '1-Ph',
          value: '1-Ph'
        },
        {
          label: '3-Ph',
          value: '3-Ph'
        }
      ]
    ],
    'select#communication_protocol': [
      'Select protocol',
      [
        {
          label: 'MQTT',
          value: 'MQTT'
        },
        {
          label: 'TCP',
          value: 'TCP'
        }
      ]
    ],
    'text#pub_topic': ['Publisher topic'],
    'text#sub_topic': ['Subscriber topic'],
    'text#ip_address': ['IP Address'],
    'text#port': ['Port'],
    'text#system_title': ['System title*'],
    'text#authentication_key': ['Authentication key*'],
    'text#encryption_key': ['Encryption key*'],
    'text#dedicated_key': ['Dedicated key*'],
    'text#reader_password': ['Reader Password*'],
    'text#utility_setting_password': ['Utility Setting Password*'],
    'text#firmware_password': ['Firmware Password*'],
    'text#firmware_version': ['Firmware Version*']
  }

  const closeMeterConfigurationModal = () => {
    setMeterConfigModal(!meterConfigModal)
  }

  const createForm = props => {
    return <MeterConfigurationForm closeMeterConfigurationModal={closeMeterConfigurationModal} />
  }

  const createTable = props => {
    return <ConfiguredMeterList />
  }

  return (
    <div>
      <Row>
        <Col md='6'></Col>
        <Col md='3' xs='6' className='mb-1'>
          <Button.Ripple outline color='primary' size='sm' className='btn-block' onClick={() => setMeterConfigModal(!meterConfigModal)}>
            Meter Configuration
          </Button.Ripple>
        </Col>
        <Col md='3' xs='6' className='mb-1'>
          <Button.Ripple outline color='primary' size='sm' className='btn-block' onClick={() => setMeterConfigListModal(!meterConfigListModal)}>
            Configured Meter List
          </Button.Ripple>
        </Col>
      </Row>

      <Modal isOpen={meterConfigModal} toggle={() => setMeterConfigModal(!meterConfigModal)} className='modal-dialog-centered modal-lg'>
        <ModalHeader toggle={() => setMeterConfigModal(!meterConfigModal)}>Meter configuration</ModalHeader>
        <ModalBody>{createForm()}</ModalBody>
      </Modal>

      <Modal isOpen={meterConfigListModal} toggle={() => setMeterConfigListModal(!meterConfigListModal)} className='modal-dialog-centered modal_size'>
        <ModalHeader toggle={() => setMeterConfigListModal(!meterConfigListModal)}>Configured meter list</ModalHeader>
        <ModalBody>{createTable()}</ModalBody>
      </Modal>
    </div>
  )
}

export default MeterConfiguration
