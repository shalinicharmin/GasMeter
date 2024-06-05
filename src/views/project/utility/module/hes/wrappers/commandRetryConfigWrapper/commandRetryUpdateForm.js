// // ** Reactstrap Imports
import { Card, CardBody, Col, Input, Form, Button, Label, Row, Modal, ModalHeader, ModalBody, Tooltip } from 'reactstrap'

import React, { useState, useEffect } from 'react'

// import { Col, Row, Modal, ModalHeader, ModalBody, Tooltip, Button } from 'reactstrap'
import { Plus, Edit } from 'react-feather'

import { useHistory, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'

import useJwt from '@src/auth/jwt/useJwt'

import authLogout from '../../../../../../../auth/jwt/logoutlogic'

const CommandRetryUpDateForm = props => {
  // console.log('Row Selected .....')
  // console.log(props.rowSelected)

  const location = useLocation()
  const dispatch = useDispatch()
  const history = useHistory()
  let project = ''
  if (location.pathname.split('/')[2] === 'sbpdcl') {
    project = 'ipcl'
  } else {
    project = location.pathname.split('/')[2]
  }

  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const fetchData = async params => {
    return await useJwt
      .updateDLMSCommandRetryCommand(params)
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

  const [retryCount, setRetryCount] = useState(props.rowSelected.command_retry)

  const onHandleChange = val => {
    // console.log(val.target.value)
    if (val) {
      setRetryCount(val.target.value)
    } else {
      setRetryCount(undefined)
    }
  }

  const onUpdateRetryCount = async () => {
    // console.log('Retry Count Updated .....')
    if (retryCount) {
      if (retryCount < 0) {
        toast.warning(<Toast msg={'Retry count cannot be less than 0 ...'} type='warning' />, { hideProgressBar: true })
      } else {
        const params = {
          project,
          command: props.rowSelected.command,
          cmd_retry: retryCount
        }

        const [statusCode, response] = await fetchData(params)

        if (statusCode === 202) {
          props.reloadTableAfterUpdate()
          toast.success(<Toast msg={'Retry count updated successfully .....'} type='success' />, { hideProgressBar: true })
        } else if (statusCode === 401 || statusCode === 403) {
          setLogout(true)
        } else {
          toast.warning(<Toast msg={'Something went wrong, please retry ....'} type='warning' />, { hideProgressBar: true })
        }
      }
    } else {
      toast.warning(<Toast msg={'Enter retry count ....'} type='warning' />, { hideProgressBar: true })
    }
  }

  return (
    <Card className='mb-0'>
      <CardBody>
        <Row>
          <Col md='6' sm='12' className='mb-1'>
            <Label className='form-label' for='name'>
              Retry Count
            </Label>
            <Input type='number' defaultValue={retryCount} onChange={onHandleChange} />

            {/* <p className='text-danger'>{formErrors.username}</p> */}
          </Col>
        </Row>
        <Row>
          <Col className='d-flex' md={{ size: 9 }}>
            <Button className='me-1' color='primary' onClick={onUpdateRetryCount}>
              Update
            </Button>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

export default CommandRetryUpDateForm
