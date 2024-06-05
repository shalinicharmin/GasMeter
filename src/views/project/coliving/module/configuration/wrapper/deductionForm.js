import { Button, Col, Form, Row, Spinner } from 'reactstrap'
import CreateFormField from '@src/views/ui-elements/formElement/createForm'
import { useState, useEffect } from 'react'
import useJwt from '@src/auth/jwt/useJwt'
import jwt_decode from 'jwt-decode'
import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import moment from 'moment'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import authLogout from '@src/auth/jwt/logoutlogic'

const MySwal = withReactContent(Swal)

const DeductionForm = props => {
  const [spiner, setSpiner] = useState(false)

  // Logout User
  const [logout, setLogout] = useState(false)
  const dispatch = useDispatch()
  const history = useHistory()
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const fields = {
    'number#deduction_amount': { label: 'Amount (INR)*' },
    'date#deduction_from_date': { label: 'Deduction from date*', options: { minDate: moment().add(1, 'days').format('YYYY-MM-DD') } }
  }
  const selected = { add: '', update: '', all: '' }

  if (props.row) {
    for (const i of props.row[0]) {
      if (i.amount !== '-') {
        selected.update += `${i.sc_no}, `
      } else {
        selected.add += `${i.sc_no}, `
      }
      selected.all += `${i.sc_no},`
    }
  }

  let userEmail = 'n/a'

  if (localStorage.getItem('accessToken')) {
    userEmail = jwt_decode(localStorage.getItem('accessToken')).userData.email
  }

  const addUpdateDeduction = async params => {
    return await useJwt
      .addUpdateDeduction(params)
      .then(res => {
        const status = res.status
        return [status, res]
      }).catch(err => {
        if (err.response) {
          const status = err.response.status
          return [status, err]
        } else {
          return [0, err]
        }
      })
  }

  const handleFormSubmit = async e => {
    e.preventDefault()
    setSpiner(true)

    const formData = new FormData(document.getElementById('dailyDeductionForm'))

    formData.set('site_id', props.row[2].value)
    formData.set('sc_no', selected.all.substring(0, selected.all.length - 1))
    formData.set('admin', userEmail)

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
      if (key === 'deduction_amount') {
        if (parseFloat(value) > 1000 || parseFloat(value) < -1000) {
          toast.warning(<Toast msg={`Deduction amount shoud not be greator then 1000 and less then -1000 Rs.`} type='warning' />, { hideProgressBar: true })
          flag = false
        }
      }
      params[key] = value
    })

    if (!flag) {
      setSpiner(false)
      return false
    }

    const [statusCode, response] = await addUpdateDeduction(params)

    if (statusCode === 201 || statusCode === 200) {
      const resp = response.data.data.result

      MySwal.fire({
        icon: 'success',
        title: 'Success',
        html: `
          ${resp.added.length ? `<b>Added:</b> ${JSON.stringify(resp.added).replace('[', '').replace(']', '')} <br><br>` : ''}
          ${resp.updated.length ? `<b>Updated:</b> ${JSON.stringify(resp.updated).replace('[', '').replace(']', '')} <br><br>` : ''}
          ${resp.escaped.length ? `<b>Escaped:</b> ${JSON.stringify(resp.escaped).replace('[', '').replace(']', '')} <br><br>` : ''}
        `,
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

  return <Form id='dailyDeductionForm'>
    <Row>
      {/* <Col className='mb-2'>
        {selected.add && <><span className='h5'>Addable: </span> {selected.add} </>}
        {selected.add && selected.update && <><br></br> <br></br></>}
        {selected.update && <><span className='h5'>Updateable: </span> {selected.update}</>}
      </Col> */}

      <CreateFormField fields={fields} />

      <Col xs='12' className='text-center pb-1 pt-2'>
        <Button color='primary' onClick={handleFormSubmit} disabled={(spiner || !selected.all) && true}>
          Set Deduction &nbsp; &nbsp; {spiner && <Spinner size='sm' />}
        </Button>
      </Col>
    </Row>
  </Form>
}

export default DeductionForm