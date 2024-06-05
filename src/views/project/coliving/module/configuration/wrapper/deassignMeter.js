import { useEffect, useState } from "react"
import { Button, Spinner } from "reactstrap"
import useJwt from '@src/auth/jwt/useJwt'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import authLogout from '@src/auth/jwt/logoutlogic'

const MySwal = withReactContent(Swal)

const DeassignMeter = props => {
  const [ldp, setLdp] = useState({})
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

  const dissociateMeter = async params => {
    return await useJwt
      .dissociateMeter(params)
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
    } else if (statusCode === 401 || statusCode === 403) {
      setLogout(true)
    }
  }, [])

  const handleDissociation = async () => {
    setSpiner(true)
    const params = {
      mobile: props.row.user_mobile,
      sc_no: props.row.sc_no,
      credit_remain: ldp.credit_remain
    }
    const [statusCode, response] = await dissociateMeter(params)
    if (statusCode === 200) {
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
            confirmButton: 'btn btn-success'
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

  return <div className='text-center font-weight-bold p-1 px-3'>
    <p className='m-0'>Credit remaining in meter</p>
    <p className='m-0'>
      <span className='font-weight-bolder text-primary h2'>
        INR {('credit_remain' in ldp) ? ldp.credit_remain : <Spinner className='mb_5' type='grow' size='sm' />}
      </span> <span className='font-weight-bolder'> Credits remaining</span>
    </p>
    <p className='m-0 font-weight-bolder'>By {('LDP' in ldp) ? ldp.LDP : <Spinner type='grow' size='sm' />}</p>
    <p>Are you sure you want to dissociate user <b>{props.row.user_name}</b> account?</p>
    <small>This action cannot be undone. The credits will become Zero after de-assign, If this is the last User associated</small>
    <Button className='btn btn-danger mt-2' onClick={() => handleDissociation()} disabled={(spiner || !Object.keys(ldp).length) && true}>Dissociate &nbsp; &nbsp; {spiner && <Spinner size='sm' />}</Button>
  </div>
}

export default DeassignMeter