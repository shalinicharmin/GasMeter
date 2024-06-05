// // ** Reactstrap Imports
import { Card, CardBody, Col, Input, Form, Button, Label, Row } from 'reactstrap'

import { useState, useEffect } from 'react'

function AddSchedulerData() {
  const initialValues = { username: '', task: '', minute: '*', hour: '*', day_month: '*', month: '*', day_week: '*', arguments: '', enable: false }
  const [formValues, setFormValues] = useState(initialValues)
  // const [formErrors, setFormErrors] = useState({})
  // const [isSubmit, setIsSubmit] = useState(false)

  const handleChange = e => {
    const { name, value } = e.target
    if (name === 'enable') {
      setFormValues({ ...formValues, [name]: e.target.checked })
    } else {
      setFormValues({ ...formValues, [name]: value })
    }
  }

  // useEffect(() => {
  //   // console.log(formErrors)
  //   if (Object.keys(formErrors).length === 0 && isSubmit) {
  //     console.log(formValues)
  //   }
  // }, [formErrors])
  // const validate = values => {
  //   const errors = {}
  //   const regex1 = /^(([0]?[0-5][0-9]|[0-9]))$/
  //   const regex2 = /^(2[0-3]|[01]?[0-9])$/
  //   const regex3 = /^(0[1-9]|[12]\d|3[01])$/
  //   const regex4 = /^(0[1-9]|1[0-2]|[1-9])$/
  //   const regex5 = /^[0-6]+$/

  // if (!values.username) {
  //   errors.username = 'Username is required!'
  // }
  // if (!values.task) {
  //   errors.task = 'Task is required!'
  // }
  //   if (!values.minute) {
  //     // errors.minute = 'Required!'
  //   } else if (!regex1.test(values.minute)) {
  //     errors.minute = 'Minute should be in range 0 to 59'
  //   }
  //   if (!values.hour) {
  //     // errors.hour = 'Required!'
  //   } else if (!regex2.test(values.hour)) {
  //     errors.hour = 'Minute should be in range 0 to 23'
  //   }
  //   if (!values.day_month) {
  //     // errors.day_month = 'Required!'
  //   } else if (!regex3.test(values.day_month)) {
  //     errors.day_month = 'Minute should be in range 1 to 31'
  //   }
  //   if (!values.month) {
  //     // errors.month = 'Required!'
  //   } else if (!regex4.test(values.month)) {
  //     errors.month = 'Month should be in range 1 to 12'
  //   }
  //   if (!values.day_week) {
  //     // errors.day_week = 'Required!'
  //   } else if (!regex5.test(values.day_week)) {
  //     errors.day_week = 'Week should be in range 0 to 6'
  //   }
  //   // if (!values.arguments) {
  //   //   errors.arguments = 'Arguments is required!'
  //   // }

  //   return errors
  // }

  const handleSubmit = e => {
    e.preventDefault()
    // setFormErrors(validate(formValues))
    // setIsSubmit(true)
    // console.log(formValues)
    setFormValues({ username: '', task: '', minute: '*', hour: '*', day_month: '*', month: '*', day_week: '*', arguments: '', enable: false })
  }
  return (
    <Card className='mb-0'>
      <CardBody>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md='6' sm='12' className='mb-1'>
              <Label className='form-label' for='name'>
                Name
              </Label>
              <Input type='text' name='username' placeholder='Username' value={formValues.username} onChange={handleChange} />

              {/* <p className='text-danger'>{formErrors.username}</p> */}
            </Col>

            <Col md='6' sm='12' className='mb-1'>
              <Label className='form-label' for='task'>
                Task
              </Label>
              <Input type='text' name='task' placeholder='Task' value={formValues.task} onChange={handleChange} />
              {/* <p className='text-danger'>{formErrors.task}</p> */}
            </Col>
          </Row>

          <Row>
            <Label sm='12' for='schedule'>
              Schedule
            </Label>
          </Row>
          <Row>
            <Col sm='4' className='mb-1'>
              <Label className='form-label' for='minute'>
                Minute
              </Label>
              <Input type='text' name='minute' placeholder='Minute' value={formValues.minute ?? ''} onChange={handleChange} />
              <h6 style={{ fontSize: '11px', fontStyle: 'italic' }}>Corn Minutes to Run .Use "*" for "all". (Example : "0,30")</h6>
              {/* <p className='text-danger'>{formErrors.minute}</p> */}
            </Col>
            <Col sm='4' className='mb-1'>
              <Label className='form-label' for='hour'>
                Hour
              </Label>
              <Input type='text' name='hour' placeholder='Hour' value={formValues.hour ?? ''} onChange={handleChange} />
              {/* <p className='text-danger'>{formErrors.hour}</p> */}
              <h6 style={{ fontSize: '11px', fontStyle: 'italic' }}>Corn Hours to Run .Use "*" for "all". (Example : "8,20")</h6>
            </Col>
            {/* {hourErr && <p>hour must be in 24 :00 hour formaatt</p>} */}
            <Col sm='4' className='mb-1'>
              <Label className='form-label' for='nameVertical'>
                Day(Month)
              </Label>
              <Input type='text' name='day_month' placeholder='Day(Month)' value={formValues.day_month ?? ''} onChange={handleChange} />
              {/* <p className='text-danger'>{formErrors.day_month}</p> */}
              <h6 style={{ fontSize: '11px', fontStyle: 'italic' }}>Corn Days of the Week to Run .Use "*" for "all". (Example : "0,5")</h6>
            </Col>
            <Col sm='4' className='mb-1'>
              <Label className='form-label' for='month'>
                Month
              </Label>
              <Input type='text' name='month' placeholder='Month' value={formValues.month ?? ''} onChange={handleChange} />
              {/* <p className='text-danger'>{formErrors.month}</p> */}
              <h6 style={{ fontSize: '11px', fontStyle: 'italic' }}>Corn Days of the Month to Run .Use "*" for "all". (Example : "1,15")</h6>
            </Col>
            <Col sm='4' className='mb-1 '>
              <Label className='form-label' for='day_week'>
                Day(week)
              </Label>
              <Input type='text' name='day_week' placeholder='Day(week)' value={formValues.day_week} onChange={handleChange} />
              {/* <p className='text-danger'>{formErrors.day_week}</p> */}
              <h6 style={{ fontSize: '11px', fontStyle: 'italic' }}>Corn Months of the Year to Run .Use "*" for "all". (Example : "0,6")</h6>
            </Col>
          </Row>

          <Row>
            <Col sm='12' className='mb-1'>
              <Label className='form-label'>Arguments</Label>
              <Input type='textarea' name='arguments' id='exampleText' value={formValues.arguments} onChange={handleChange} />
              {/* <p className='text-danger'>{formErrors.arguments}</p> */}
            </Col>
          </Row>

          <Row className='mb-1'>
            <Col sm={{ size: 9 }}>
              <div className='form-check'>
                <Input type='checkbox' name='enable' onChange={handleChange} />
                <Label for='enable'>Enable</Label>
              </div>
            </Col>
          </Row>
          <Row>
            <Col className='d-flex' md={{ size: 9 }}>
              <Button className='me-1' color='primary' type='submit'>
                Save
              </Button>
            </Col>
          </Row>
        </Form>
      </CardBody>
    </Card>
  )
}

export default AddSchedulerData
