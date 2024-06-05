import { useEffect, useState } from "react"
import { Button, Col, Form, Row, Spinner } from "reactstrap"
import { useLocation, useHistory } from 'react-router-dom'
import CreateFormField from "@src/views/ui-elements/formElement/createForm"
import useJwt from '@src/auth/jwt/useJwt'
import jwt_decode from 'jwt-decode'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import { useDispatch } from 'react-redux'
import authLogout from '@src/auth/jwt/logoutlogic'

const MySwal = withReactContent(Swal)

const AssignMeter = props => {
  const location = useLocation()
  const uri = location.pathname.split('/')

  const [ldp, setLdp] = useState({})
  const [spiner, setSpiner] = useState(false)

  let userEmail = 'n/a'

  if (localStorage.getItem('accessToken')) {
    userEmail = jwt_decode(localStorage.getItem('accessToken')).userData.email
  }

  // Logout User
  const [logout, setLogout] = useState(false)
  const dispatch = useDispatch()
  const history = useHistory()
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const fetchCredit = async params => {
    return await useJwt
      .getCredit(params)
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

  const associateMeter = async params => {
    return await useJwt
      .associateMeter(params)
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

  const updateAssociated = async params => {
    return await useJwt
      .updateAssociated(params)
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
      sc_no: props.row.sc_no
    }
    const [statusCode, response] = await fetchCredit(params)

    if (statusCode === 200) {
      setLdp(response.data.data.result);
    } else if (statusCode === 206) {
      toast.warning(<Toast msg={response.data.detail} type='warning' />, { hideProgressBar: true })
    } else if (statusCode === 401 || statusCode === 403) {
      setLogout(true)
    } else {
      toast.error(<Toast msg='Something went wrong.' type='error' />, { hideProgressBar: true })
    }
  }, [])

  const fields = {
    'text#user_mobile': { label: 'Enter mobile number*' },
    'text#user_name': { label: 'Name*' },
    'email#user_email': { label: 'E-mail*' }
  }

  if (uri[1] !== 'coliving') {
    fields['number#eb_load'] = { label: 'EB load (watt)*', value: props.row.eb_load && props.row.eb_load }
    fields['number#dg_load'] = { label: 'DG load (watt)*', value: props.row.dg_load && props.row.dg_load }
    fields['number#flat_area'] = { label: 'Flat area sq. ft.*', value: props.row.flat_area && props.row.flat_area }
  }

  if (props.type === 'update') {
    fields['text#user_mobile']['disable'] = true
  }

  const formSubmitHandler = async e => {
    e.preventDefault()
    setSpiner(true)

    const formData = new FormData(document.getElementById('assignMeterForm'))

    formData.set('updated_by', userEmail)
    formData.set('credit_remaining', ldp.credit_remain)
    formData.set('sc_no', props.row.sc_no)

    if (props.type === 'update') {
      formData.set('user_mobile', props.row.user_mobile)
    }

    const params = {}
    let flag = true

    formData.forEach((value, key) => {
      if (!flag) {
        return true
      }
      if (!value) {
        toast.warning(<Toast msg={`${key} should not be null.`} type='warning' />, { hideProgressBar: true })
        flag = false
      }
      if (key === 'user_mobile') {
        value = value.replace(/[^0-9]/g, '')
        if (value.length !== 10) {
          toast.warning(<Toast msg={`Consumer ${key} length must be equal to 10 digits.`} type='warning' />, { hideProgressBar: true })
          flag = false
        }
      } else if (key === 'user_name') {
        if (value.length > 50) {
          toast.warning(<Toast msg={`Consumer ${key} length must be under to 50 digits.`} type='warning' />, { hideProgressBar: true })
          flag = false
        }
        if (!/^[a-zA-Z ]+$/.test(value)) {
          toast.warning(<Toast msg={'Name should be only character.'} type='warning' />, { hideProgressBar: true })
          flag = false
        }
      } else if (key === 'email') {
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
          toast.warning(<Toast msg={'Please insert correct email.'} type='warning' />, { hideProgressBar: true })
          flag = false
        }
      } else if (key === 'flat_area') {
        if (value > 5000 || value < 500) {
          toast.warning(<Toast msg={`Consumer ${key} must be 500 to 5000 digits.`} type='warning' />, { hideProgressBar: true })
          flag = false
        }
      } else if (key === 'eb_load') {
        if (!/^\d+(\.\d{1,2})?$/.test(Number(value)) || Number(value) < 1 || value > 50000) {
          toast.warning(<Toast msg={`Consumer ${key} Must be two decimal point from 1 to 50000 watt.`} type='warning' />, { hideProgressBar: true })
          flag = false
        }
      } else if (key === 'dg_load') {
        if (!/^\d+(\.\d{1,2})?$/.test(Number(value)) || Number(value) < 1 || value > 20000) {
          toast.warning(<Toast msg={`Consumer ${key} Must be two decimal point from 1 to 20000 watt.`} type='warning' />, { hideProgressBar: true })
          flag = false
        }
      }
      params[key] = value
    })

    if (!flag) {
      setSpiner(false)
      return false
    }

    const [statusCode, response] = props.type === 'add' ? await associateMeter(params) : await updateAssociated(params)

    if (statusCode === 201 || statusCode === 200) {
      MySwal.fire({
        icon: 'success',
        title: 'Success',
        text: response.data.data.result,
        customClass: {
          confirmButton: 'btn btn-success'
        }
      })
      props.retry()
    } else if (statusCode === 401 || statusCode === 403) {
      setLogout(true)
    } else {
      try {
        MySwal.fire({
          icon: 'error',
          title: 'Please notice !',
          text: response.data.detail,
          customClass: {
            confirmButton: 'btn btn-danger'
          }
        })
      } catch (err) {
        MySwal.fire({
          icon: 'error',
          title: 'Please notice !',
          text: 'Something went wrong',
          customClass: {
            confirmButton: 'btn btn-danger'
          }
        })
      }
    }
    setSpiner(false)
  }

  return <>
    <div className='text-center'>
      <span className='font-weight-bolder text-primary h2'>
        INR {('credit_remain' in ldp) ? ldp.credit_remain : <Spinner className='mb_5' type='grow' size='sm' />}
      </span>
      <span> Credits remaining</span><br></br>
      <p className='font-weight-bold'>
        On <span className='font-weight-bolder'>{('LDP' in ldp) ? ldp.LDP : <Spinner type='grow' size='sm' />}</span>
        &nbsp; for Meter <span className='font-weight-bolder'>{props.row.meter_ip}</span>
      </p>
    </div>

    <Form id='assignMeterForm'>
      <Row>
        <CreateFormField fields={fields} values={props.row} type={props.type} />
      </Row>
      <Row>
        <Col xs='12' className='text-center my-1'>
          <Button color='primary' onClick={e => formSubmitHandler(e)} disabled={(spiner || props.type === 'view' || !Object.keys(ldp).length) && true}>
            Associate this meter &nbsp; &nbsp; {spiner && <Spinner size='sm' />}
          </Button>
        </Col>
      </Row>
    </Form>
  </>
}

export default AssignMeter