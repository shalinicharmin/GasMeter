import React, { useState, useEffect } from 'react'
import { Button, Col, Form, FormGroup, Input, Label, Row } from 'reactstrap'
import Select from 'react-select'
import { selectThemeColors } from '@utils'
import { ArrowLeft } from 'react-feather'
import useJwt from '@src/auth/jwt/useJwt'
import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import authLogout from '../../../../auth/jwt/logoutlogic'

const ManuallyAddMeterForm = props => {
  const dispatch = useDispatch()
  const history = useHistory()

  const { siteId, pssId, feederId, handleCreateUserFormModal } = props
  // console.log(props)
  const [formValue, setFormValue] = useState({
    site_id: siteId.value,
    meter_serial: '',
    meter_address: '',
    sc_no: '',
    grid_id: ''
  })

  const [selectedManufacturer, setSelectedManufacturer] = useState(undefined)
  const [selectedCommunication, setSelectedCommunication] = useState(undefined)
  const [selectedMeterPhase, setSelectedMeter] = useState(undefined)
  const [checkedScNo, setCheckedScNo] = useState(false)
  const [checkedGridId, setcheckedGridId] = useState(false)

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  // Post request to upload file manually
  const postUploadFileManually = async params => {
    try {
      const param = {
        get_meter_data: [
          {
            ...formValue,
            manufacturer: selectedManufacturer,
            communication_protocol: selectedCommunication,
            phase: selectedMeterPhase,
            pss_id: pssId,
            feeder_id: feederId
          }
        ]
      }
      // console.log(param)
      const res = await useJwt.postUploadFileManually(param)
      if (res.status === 201) {
        setFormValue(formValue)
        toast.success(<Toast msg={'Manually Meter added Successfully.'} type='success' />, { hideProgressBar: true })
        handleCreateUserFormModal()
      } else if (res.status === 401 || res.status === 403) {
        setLogout(true)
      }
    } catch (error) {
      if (error.response.status === 401 || error.response.status === 403) {
        setLogout(true)
      } else {
        toast.error(<Toast msg='Something went wrong please retry .' type='danger' />, { hideProgressBar: true })
      }
    }
  }

  // Manufacturer dropdown options
  const Manufacturer = [
    { value: 'AME_3P', label: 'AME_3P' },
    { value: 'GP', label: 'GP' },
    { value: 'EEO_3P', label: 'EEO_3P' },
    { value: 'EEO', label: 'EEO' },
    { value: 'CPS_LTCT', label: 'CPS_LTCT' },
    { value: 'CPS_1P', label: 'CPS_1P' },
    { value: 'CPS_3P', label: 'CPS_3P' },
    { value: 'AME_1P', label: 'AME_1P' },
    { value: 'AME_LTCT', label: 'AME_LTCT' },
    { value: 'GP_LTCT', label: 'GP_LTCT' },
    { value: 'EEO_LTCT', label: 'EEO_LTCT' }
  ]

  // communication protocol dropdown options
  const Communication_Protocol = [
    { value: 'RF', label: 'RF' },
    { value: 'TCP', label: 'TCP' },
    { value: 'MQTT', label: 'MQTT' }
  ]

  // MEter phase dropdown options
  const Meter_Phase = [
    { value: '1-Ph', label: '1-Ph' },
    { value: '3-ph', label: '3-Ph' }
  ]

  //  handle change on selection of manufracturer
  const ondropdownManufacturer = e => {
    setSelectedManufacturer(e.value)
  }

  // handle  change on selection of communication
  const onDropdownCommunication = e => {
    setSelectedCommunication(e.value)
    if (e.value === 'TCP') {
      formValue.Ipv6 = ''
    } else {
      if ('Ipv6' in formValue) {
        delete formValue['Ipv6']
      }
    }
  }

  // on handle change of dropdown options meter phase
  const onDropdownMeter = e => {
    setSelectedMeter(e.value)
  }

  // handle change on form values
  const handlechange = event => {
    const name = event.target.name
    const value = event.target.value.replace(/[^0-9]/g, '')
    setFormValue(values => ({ ...values, [name]: value }))
  }

  const handleChangeMeterAdress = event => {
    const name = event.target.name
    const inputValue = event.target.value
    setFormValue(values => ({ ...values, [name]: inputValue }))
  }

  // checbox on sc no
  const handleCheckScNo = event => {
    const name = event.target.name
    const value = event.target.checked
    setCheckedScNo(value)
    formValue.sc_no = value ? formValue.meter_serial : ''
  }

  // checkbox on gridid
  const handleCheckGridId = event => {
    const name = event.target.name
    const value = event.target.checked
    setcheckedGridId(value)
    formValue.grid_id = value ? formValue.meter_serial : ''
  }

  // validation of form
  const onValidation = e => {
    e.preventDefault()
    if (!selectedManufacturer) {
      toast.warning(<Toast msg={'Select manufacturer.'} type='warning' />, { hideProgressBar: true })
      return false
    }
    if (!selectedCommunication) {
      toast.warning(<Toast msg={'Select Communication.'} type='warning' />, { hideProgressBar: true })
      return false
    }
    if (!selectedMeterPhase) {
      toast.warning(<Toast msg={'Select MeterPhase.'} type='warning' />, { hideProgressBar: true })
      return false
    }
    if (
      formValue.Ipv6 &&
      !/^(?:(?:[a-fA-F\d]{1,4}:){7}(?:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,2}|:)|(?:[a-fA-F\d]{1,4}:){4}(?:(?::[a-fA-F\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,3}|:)|(?:[a-fA-F\d]{1,4}:){3}(?:(?::[a-fA-F\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,4}|:)|(?:[a-fA-F\d]{1,4}:){2}(?:(?::[a-fA-F\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,5}|:)|(?:[a-fA-F\d]{1,4}:){1}(?:(?::[a-fA-F\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,6}|:)|(?::(?:(?::[a-fA-F\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,7}|:)))(?:%[0-9a-zA-Z]{1,})?$/gm.test(
        formValue.Ipv6
      )
    ) {
      toast.warning(<Toast msg={'Please insert correct Ipv6.'} type='warning' />, { hideProgressBar: true })
      return false
    }
    if (
      formValue.meter_address &&
      !/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(formValue.meter_address)
    ) {
      toast.warning(<Toast msg={'Please insert correct  meter Address.'} type='warning' />, { hideProgressBar: true })
      return false
    }
    postUploadFileManually()
  }

  return (
    <>
      <Form
        onSubmit={e => {
          onValidation(e)
        }}>
        <Row>
          <Col lg='4'>
            <FormGroup>
              <Label for='Manufacturer'>Manufacturer </Label>
              <Select
                theme={selectThemeColors}
                className='react-select'
                classNamePrefix='select'
                // defaultValue={colourOptions[1]}
                name='clear'
                options={Manufacturer}
                // value={selectedManufacturer}
                onChange={ondropdownManufacturer}
                // isClearable
                placeholder='Select Manufacturer'
              />
            </FormGroup>
          </Col>

          <Col lg='4'>
            <FormGroup>
              <Label for='Communication protocol'>Communication protocol </Label>
              <Select
                theme={selectThemeColors}
                className='react-select'
                classNamePrefix='select'
                // defaultValue={colourOptions[1]}
                name='clear'
                onChange={onDropdownCommunication}
                // value={selectedCommunication}
                options={Communication_Protocol}
                // isClearable
                placeholder='Select Communication protocol'
              />
            </FormGroup>
          </Col>

          <Col lg='4'>
            <FormGroup>
              <Label for='Meter Phase'>Meter Phase </Label>
              <Select
                theme={selectThemeColors}
                // value={selectedMeterPhase}
                className='react-select'
                classNamePrefix='select'
                // defaultValue={colourOptions[1]}
                name='clear'
                options={Meter_Phase}
                onChange={onDropdownMeter}
                // isClearable
                placeholder='Select Meter Phase'
              />
            </FormGroup>
          </Col>

          {selectedCommunication === 'TCP' ? (
            <Col lg='4' className=''>
              <Label for='IPv6'>IPv6 </Label>
              <Input type='text' name='Ipv6' id='IPv6' placeholder='IPv6*' value={formValue.Ipv6} onChange={handleChangeMeterAdress} required />
            </Col>
          ) : (
            ''
          )}

          <Col lg='4'>
            <FormGroup>
              <Label for='Site Id'>Site Id </Label>
              <Input
                type='text'
                name='site_id'
                id='Site Id'
                placeholder='Site Id*'
                value={formValue.site_id}
                onChange={handlechange}
                required
                disabled
              />
            </FormGroup>
          </Col>
          <Col lg='4'>
            <FormGroup>
              <Label for='Site Id'>Feeder Id </Label>
              <Input type='text' name='feeder_id' id='Site Id' placeholder='Site Id*' value={feederId} onChange={handlechange} required disabled />
            </FormGroup>
          </Col>

          <Col lg='4'>
            <FormGroup>
              <Label for='Site Id'>Pss Id </Label>
              <Input type='text' name='pss_id' id='Site Id' placeholder='Site Id*' value={pssId} onChange={handlechange} required disabled />
            </FormGroup>
          </Col>

          <Col lg='4' className=''>
            <FormGroup>
              <Label for='Meter Serial '>Meter Serial </Label>
              <Input
                type='text'
                name='meter_serial'
                id='Meter Serial '
                placeholder='Meter Serial  *'
                value={formValue.meter_serial}
                onChange={handlechange}
                required
              />
            </FormGroup>
          </Col>

          <Col lg='4'>
            <FormGroup>
              <Label for='Meter Address'>Meter Address</Label>
              <Input
                type='tel'
                name='meter_address'
                id='Meter Address'
                placeholder='Meter Address*'
                value={formValue.meter_address}
                onChange={handleChangeMeterAdress}
                required
              />
            </FormGroup>
          </Col>

          <Col lg='4' className=''>
            <Label for='Sc_No'>Sc No</Label>
            <Input
              type='text'
              name='sc_no'
              id='Sc_No'
              placeholder='Sc_No or same as Meter Serial*'
              value={checkedScNo ? formValue.meter_serial : formValue.sc_no}
              onChange={handlechange}
              required
              disabled={checkedScNo}
            />
            <FormGroup check inline className='mt_5'>
              <Input type='checkbox' id='basic-cb-unchecked1' name='enableScNo' className='' onChange={handleCheckScNo} value={checkedScNo} />
              <Label for='basic-cb-unchecked1' check className='h6'>
                Same as a meter Serial
              </Label>
            </FormGroup>
          </Col>

          <Col lg='4' className=''>
            <Label for='Grid Id'>Grid Id</Label>
            <Input
              type='text'
              name='grid_id'
              id='Grid Id'
              placeholder='Grid Id or same as Meter Serial*'
              value={checkedGridId ? formValue.meter_serial : formValue.grid_id}
              onChange={handlechange}
              required
              disabled={checkedGridId}
            />
            <FormGroup check inline className='mt_5'>
              <Input type='checkbox' id='basic-cb-unchecked' name='enableGrid' className='' onChange={handleCheckGridId} value={checkedGridId} />
              <Label for='basic-cb-unchecked' check className='h6'>
                Same as a meter Serial
              </Label>
            </FormGroup>
          </Col>
        </Row>
        <Col sm='12'>
          <div className=' float-right mt-2'>
            <Button.Ripple color='success' className='btn-submit' type='submit'>
              Submit
            </Button.Ripple>
          </div>
        </Col>
      </Form>
    </>
  )
}

export default ManuallyAddMeterForm
