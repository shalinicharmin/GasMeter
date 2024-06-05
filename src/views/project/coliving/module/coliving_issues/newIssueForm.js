import React, { useState, useEffect } from 'react'
import { FormGroup, Button, Row, Col, Input, Form } from 'reactstrap'
import Select from 'react-select'
import useJwt from '@src/auth/jwt/useJwt'
import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import { selectThemeColors } from '@utils'
import jwt_decode from 'jwt-decode'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import authLogout from '../../../../../auth/jwt/logoutlogic'

const NewIssueForm = props => {
  const dispatch = useDispatch()
  const history = useHistory()

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const [formData, setFormData] = useState({
    categoryId: 0,
    email: jwt_decode(localStorage.getItem('accessToken')).userData.email,
    phone: jwt_decode(localStorage.getItem('accessToken')).userData.phone_number,
    issueDescription: '',
    createdBy: jwt_decode(localStorage.getItem('accessToken')).userData.name,
    remarks: '',
    inputs: {}
  })

  // console.log('form data.....', formData)

  const [exOptions, setExOptions] = useState('')

  const updateFormData = async () => {
    try {
      const res = await useJwt.postColivingIssue(formData)
      // console.log(res)
      if (res.status === 201) {
        setFormData(formData)
        toast.success(<Toast msg={'New Issue Added  Succesfully.'} type='success' />, { hideProgressBar: true })
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

  const issueCategories = props.data.map(category => {
    return {
      id: category.id,
      value: category.id,
      label: category.categoryTitle,
      requiredInputFields: category.requiredInputFields
    }
  })

  const collectExtraFieldsData = event => {
    // console.log('event from collectData', event)
    formData.inputs[`${event.target.id}`] = event.target.value
    setFormData(formData)
    // console.log(formData)
  }

  return (
    <>
      <Form
        onSubmit={event => {
          event.preventDefault()

          // if (formData['email']) {
          //   if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData['email'])) {
          //     toast.warning(<Toast msg={'Please insert correct email.'} type='warning' />, { hideProgressBar: true })
          //     return false
          //   }
          // }
          // if (formData['phone']) {
          //   if (formData['phone'].length !== 10) {
          //     toast.warning(<Toast msg={'Mobile number  must be 10 degits.'} type='warning' />, { hideProgressBar: true })
          //     return false
          //   }
          // }
          updateFormData()
          props.handleformpopup()
        }}
        onReset={() => {
          setFormData({
            categoryId: formData.categoryId,
            email: formData.email,
            phone: formData.phone,
            issueDescription: '',
            createdBy: formData.createdBy,
            remarks: formData.remarks,
            inputs: formData.inputs
          })
        }}>
        <Row>
          <Col sm='12'>
            <FormGroup>
              <Input
                type='email'
                name='email'
                id='email'
                placeholder='Email ( GP Employee ) *'
                onChange={event => {
                  setFormData({
                    categoryId: formData.categoryId,
                    email: event.target.value,
                    phone: formData.phone,
                    issueDescription: formData.issueDescription,
                    createdBy: formData.createdBy,
                    remarks: formData.remarks,
                    inputs: formData.inputs
                  })
                }}
                value={formData.email}
                disabled
              />
            </FormGroup>
          </Col>
          <Col sm='12'>
            <FormGroup>
              <Input
                type='tel'
                name='phone'
                id='phone'
                placeholder='Contact No. ( GP Employee ) *'
                onChange={event => {
                  setFormData({
                    categoryId: formData.categoryId,
                    email: formData.email,
                    phone: event.target.value,
                    issueDescription: formData.issueDescription,
                    createdBy: formData.createdBy,
                    remarks: formData.remarks,
                    inputs: formData.inputs
                  })
                }}
                value={formData.phone}
                disabled
              />
            </FormGroup>
          </Col>
          <Col sm='12'>
            <FormGroup>
              <Select
                id='category'
                name='category'
                theme={selectThemeColors}
                className=''
                classNamePrefix='select'
                options={issueCategories}
                isClearable={false}
                onChange={event => {
                  setExOptions(event['requiredInputFields'])
                  setFormData({
                    categoryId: event.id,
                    email: formData.email,
                    phone: formData.phone,
                    issueDescription: formData.issueDescription,
                    createdBy: formData.createdBy,
                    remarks: formData.remarks,
                    inputs: formData.inputs
                  })
                }}
                placeholder='Select Issue Type *'
                required
              />
            </FormGroup>
          </Col>
          {exOptions &&
            exOptions.map(field => {
              return (
                <Col sm='12' key={field.name}>
                  <FormGroup>
                    <Input
                      type={field.type}
                      id={field.name}
                      name={field.name}
                      placeholder={`${field.name} *`}
                      required
                      onChange={event => {
                        collectExtraFieldsData(event)
                      }}
                    />
                  </FormGroup>
                </Col>
              )
            })}

          <Col sm='12'>
            <FormGroup>
              <Input
                type='remarks'
                name='remarks'
                id='remarks'
                placeholder='Remarks'
                onChange={event => {
                  setFormData({
                    categoryId: formData.categoryId,
                    email: formData.email,
                    phone: formData.phone,
                    issueDescription: formData.issueDescription,
                    createdBy: formData.createdBy,
                    remarks: event.target.value,
                    inputs: formData.inputs
                  })
                }}
                value={formData.remarks}
              />
            </FormGroup>
          </Col>

          <Col sm='12'>
            <FormGroup>
              <Input
                type='textarea'
                name='issueDescription'
                id='issueDescription'
                rows='3'
                value={formData.issueDescription}
                placeholder='Issue Description'
                onChange={event => {
                  setFormData({
                    categoryId: formData.categoryId,
                    email: formData.email,
                    phone: formData.phone,
                    issueDescription: event.target.value,
                    createdBy: formData.createdBy,
                    remarks: formData.remarks,
                    inputs: formData.inputs
                  })
                }}
              />
            </FormGroup>
          </Col>
          <Col>{/* <FormGroup><div>{acknowledgement}</div></FormGroup> */}</Col>
          <Col sm='12'>
            <FormGroup className='d-flex mb-0'>
              <Button.Ripple className='mr-1' color='primary' type='submit'>
                Submit
              </Button.Ripple>
              <Button.Ripple outline color='secondary' type='reset'>
                Reset
              </Button.Ripple>
            </FormGroup>
          </Col>
        </Row>
      </Form>
    </>
  )
}

export default NewIssueForm
