import { Col, Row, FormGroup, Input, Form, Button, Label, CustomInput } from 'reactstrap'
import Select from 'react-select'
import useJwt from '@src/auth/jwt/useJwt'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import authLogout from '../../../../../../auth/jwt/logoutlogic'

const AccessControlForm = props => {
  // console.log("Form Data ....")
  // console.log(props.data)

  const dispatch = useDispatch()
  const history = useHistory()

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const [siteList, setSiteList] = useState([])
  const [fetchSiteList, setFetchSiteList] = useState(true)
  const [addSubmitForm, setAddSubmitForm] = useState(false)
  const [updateSubmitForm, setUpdateSubmitForm] = useState(false)

  const [formData, setFormData] = useState(props.data)

  const fetchSiteListResponse = async params => {
    return await useJwt
      .getSiteList(params)
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

  const addPropertyOwnerAccessControl = async params => {
    return await useJwt
      .addPropertyOwnerModuleAccess(params)
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

  const updatePropertyOwnerAccessControl = async params => {
    return await useJwt
      .updatePropertyOwnerModuleAccess(params['id'], params)
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
    if (fetchSiteList && props.formType === 'add') {
      const params = []
      const [statusCode, response] = await fetchSiteListResponse(params)

      for (let i = 0; i < response.data.data.result.length; i++) {
        const temp = {}
        temp['label'] = response.data.data.result[i]['site_name']
        temp['value'] = response.data.data.result[i]['site_id']
        params.push(temp)
      }
      setSiteList(params)

      if (statusCode === 200) {
        // setUserData(response.data)
        setFetchSiteList(false)
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      }
    }
  }, [fetchSiteList])

  useEffect(async () => {
    if (addSubmitForm) {
      // const params = {...formData}
      const [statusCode, response] = await addPropertyOwnerAccessControl(formData)
      if (statusCode === 201) {
        props.reloadTable()
        toast.success(<Toast msg={'New module access control successfully added .'} type='success' />, { hideProgressBar: true })
      } else if (statusCode === 208) {
        toast.warning(<Toast msg='Owner with access already exist.' type='warning' />, { hideProgressBar: true })
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else {
        toast.error(<Toast msg='Something went wrong please retry .' type='danger' />, { hideProgressBar: true })
      }
      setAddSubmitForm(false)
    }
  }, [addSubmitForm])

  useEffect(async () => {
    if (updateSubmitForm) {
      // console.log('Form Data ....')
      // console.log(formData)
      // const params = {...formData}
      const [statusCode, response] = await updatePropertyOwnerAccessControl(formData)

      if (statusCode === 200) {
        props.reloadTable()
        setUpdateSubmitForm(false)
        toast.success(<Toast msg={'Module access control successfully updated .'} type='success' />, { hideProgressBar: true })
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else {
        toast.error(<Toast msg='Something went wrong please retry .' type='danger' />, { hideProgressBar: true })
      }
    }
  }, [updateSubmitForm])

  const onSiteSelected = val => {
    // console.log("Site Selected ....")
    // console.log(val)
    if (val) {
      setFormData({
        ...formData,
        site_id: val.value,
        site_name: val.label
      })
    } else {
      setFormData({
        ...formData,
        site_id: '',
        site_name: ''
      })
    }
  }

  const onModuleSelected = val => {
    console.log(val)
    const params = { ...formData }
    if (formData[val] === 0) {
      params[val] = 1
      setFormData(params)
    } else {
      params[val] = 0
      setFormData(params)
    }
    console.log(params);
  }

  const onMobileNumberSelected = val => {
    // console.log("Mobile Number Selected")
    // console.log(val.target.value)
    setFormData({
      ...formData,
      user: val.target.value
    })
  }

  const onUserNameChange = val => {
    setFormData({
      ...formData,
      user_name: val.target.value
    })
  }

  const onEmailAddressSelected = val => {
    setFormData({
      ...formData,
      email: val.target.value
    })
  }

  const onSubmitButtonClicked = e => {
    e.preventDefault()

    if (!formData['user']) {
      toast.warning(<Toast msg={'Owner mobile number should not be null.'} type='warning' />, { hideProgressBar: true })
      return false
    } else if (!formData['site_id']) {
      toast.warning(<Toast msg={'Please select site ID.'} type='warning' />, { hideProgressBar: true })
      return false
    }

    if (formData['user']) {
      if (formData['user'].length !== 10) {
        toast.warning(<Toast msg={'Owner mobile number length must be equal to 10 degits.'} type='warning' />, { hideProgressBar: true })
        return false
      }
    }

    if (formData['email']) {
      if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData['email'])) {
        toast.warning(<Toast msg={'Please insert correct email.'} type='warning' />, { hideProgressBar: true })
        return false
      }
    }

    if (props.formType === 'add') {
      setAddSubmitForm(true)
    } else if (props.formType === 'update') {
      setUpdateSubmitForm(true)
    }
  }

  return (
    <Form className='p-2' id='accessForm'>
      <Row>
        {/* user mobile number */}
        <Col sm='6'>
          <FormGroup>
            <Label for='insertOwner'>Owner Mobile Number</Label>
            <Input
              id='insertOwner'
              placeholder='Owner Mobile Number'
              type='number'
              maxLength={10}
              defaultValue={props.formType && props.formType === 'add' ? '' : props.data.user}
              onChange={onMobileNumberSelected}
              disabled={props.formType && props.formType !== 'add'}
            />
          </FormGroup>
        </Col>
        <Col sm='6'>
          <FormGroup>
            <Label for='insertOwnerName'>Owner Name</Label>
            <Input
              id='insertOwnerName'
              placeholder='Owner Name'
              type='text'
              defaultValue={props.formType && props.formType === 'add' ? '' : props.data.user_name}
              onChange={onUserNameChange}
            // disabled={props.formType && props.formType !== 'add'}
            />
          </FormGroup>
        </Col>
        {/* User Email address */}
        <Col sm='12'>
          <FormGroup>
            <Label for='insertOwnerEmail'>Insert Owner Email Address</Label>
            <Input
              type='email'
              id='insertOwnerEmail'
              placeholder='Owner Email Address'
              onChange={onEmailAddressSelected}
              defaultValue={props.formType && props.formType === 'add' ? '' : props.data.email}
            />
          </FormGroup>
        </Col>
        {/* Site Selection or selected site option */}
        <Col sm='12'>
          {props.formType && props.formType === 'update' && (
            <FormGroup>
              <Label>Site ID </Label>
              <Input type='text' placeholder='Selected Site ID' value={props.data.site_id} disabled={true} />
            </FormGroup>
          )}
          {props.formType && props.formType === 'add' && (
            <FormGroup>
              <Label for='selectSite'>Select site</Label>
              <Select
                id='selectSite'
                isClearable={true}
                closeMenuOnSelect={true}
                options={siteList}
                className='react-select zindex_1000'
                classNamePrefix='select'
                placeholder='Select site ...'
                onChange={e => onSiteSelected(e)}
              />
            </FormGroup>
          )}
        </Col>
        {/* Assign Deassign Meter */}
        <Col md='6' sm='12' className='my_6'>
          <CustomInput
            type='checkbox'
            className='custom-control-Primary'
            id='assign_deassign'
            label='Assign Deassign Meter'
            onChange={e => onModuleSelected('assign_deassign')}
            inline
            defaultChecked={props.data && props.data.assign_deassign}
          />
        </Col>
        {/* Bill Analysis */}
        <Col md='6' sm='12' className='my_6'>
          <CustomInput
            type='checkbox'
            className='custom-control-Primary'
            id='bill_analysis'
            label='Bill analysis'
            onChange={e => onModuleSelected('bill_analysis')}
            inline
            defaultChecked={props.data && props.data.bill_analysis}
          />
        </Col>
        {/* Electricity Charges */}
        <Col md='6' sm='12' className='my_6'>
          <CustomInput
            type='checkbox'
            className='custom-control-Primary'
            id='electricity_charge'
            label='Electricity Charge'
            onChange={e => onModuleSelected('electricity_charge')}
            inline
            defaultChecked={props.data && props.data.electricity_charge}
          />
        </Col>
        {/* Property Report */}
        <Col md='6' sm='12' className='my_6'>
          <CustomInput
            type='checkbox'
            className='custom-control-Primary'
            id='property_report'
            label='Property Report'
            onChange={e => onModuleSelected('property_report')}
            inline
            defaultChecked={props.data && props.data.property_report}
          />
        </Col>
        {/* Alert */}
        <Col md='6' sm='12' className='my_6'>
          <CustomInput
            type='checkbox'
            className='custom-control-Primary'
            id='alert'
            label='Alert'
            onChange={e => onModuleSelected('alert')}
            inline
            defaultChecked={props.data && props.data.alert}
          />
        </Col>
        {/* Recharge Analysis */}
        <Col md='6' sm='12' className='my_6'>
          <CustomInput
            type='checkbox'
            className='custom-control-Primary'
            id='recharge_analysis'
            label='Recharge Analysis'
            onChange={e => onModuleSelected('recharge_analysis')}
            inline
            defaultChecked={props.data && props.data.recharge_analysis}
          />
        </Col>
        {/* Health status report */}
        <Col md='6' sm='12' className='my_6'>
          <CustomInput
            type='checkbox'
            className='custom-control-Primary'
            id='health_status_report'
            label='Health status report'
            onChange={e => onModuleSelected('health_status_report')}
            inline
            defaultChecked={props.data && props.data.health_status_report}
          />
        </Col>
        {/* Command execution */}
        <Col md='6' sm='12' className='my_6'>
          <CustomInput
            type='checkbox'
            className='custom-control-Primary'
            id='command_execution'
            label='Command execution'
            onChange={e => onModuleSelected('command_execution')}
            inline
            defaultChecked={props.data && props.data.command_execution}
          />
        </Col>
        {/* Settlement report */}
        <Col md='6' sm='12' className='my_6'>
          <CustomInput
            type='checkbox'
            className='custom-control-Primary'
            id='settlement_report'
            label='Settlement report'
            onChange={e => onModuleSelected('settlement_report')}
            inline
            defaultChecked={props.data && props.data.settlement_report}
          />
        </Col>
        {/* Live load status */}
        <Col md='6' sm='12' className='my_6'>
          <CustomInput
            type='checkbox'
            className='custom-control-Primary'
            id='live_load_status'
            label='Live load status'
            onChange={e => onModuleSelected('live_load_status')}
            inline
            defaultChecked={props.data && props.data.live_load_status}
          />
        </Col>
        <Col sm='12' className='mt-2 text-center'>
          <Button.Ripple className='mr-1' color='primary' size='sm' type='submit' onClick={onSubmitButtonClicked}>
            Submit
          </Button.Ripple>
        </Col>
      </Row>
    </Form>
  )
}

export default AccessControlForm
