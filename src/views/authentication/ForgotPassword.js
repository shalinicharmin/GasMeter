import { Link, useHistory } from "react-router-dom"
import { useSkin } from "@hooks/useSkin"
import { ChevronLeft, Send } from "react-feather"
import { Row, Col, CardTitle, CardText, Form, FormGroup, Label, Input, Button } from "reactstrap"
import "@styles/base/pages/page-auth.scss"
import { toast } from "react-toastify"
import Toast from "@src/views/ui-elements/cards/actions/createToast"
import useJwt from "@src/auth/jwt/useJwt"
import { useState, useEffect } from "react"
// import { useHistory } from 'react-router-dom'
import { useDispatch } from "react-redux"
import authLogout from "../../auth/jwt/logoutlogic"

const ForgotPasswordV2 = () => {
  const [skin, setSkin] = useSkin()
  const [params, setParams] = useState({})
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [passwd, setPasswd] = useState("")
  const [passwd2, setPasswd2] = useState("")
  const [enterOtp, setEnterOtp] = useState(false)
  const [enterPasscode, setEnterPasscode] = useState(false)
  const [reOtp, setReOtp] = useState(2)

  const [seconds, setSeconds] = useState(60)
  const [timerCompleted, setTimerCompleted] = useState(false)
  const [resendAttempts, setResendAttempts] = useState(0)

  const history = useHistory()
  const dispatch = useDispatch()

  const illustration = skin === "dark" ? "forgot-password-v2-dark.svg" : "forgot-password-v2.svg",
    source = require(`@src/assets/images/pages/${illustration}`).default,
    logo_source = require("@src/assets/images/logo/logo.ico").default

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const otpGenerate = async (params) => {
    return await useJwt
      .otpGenerate(params)
      .then((res) => {
        const status = res.status
        return [status, res]
      })
      .catch((err) => {
        if (err.response) {
          const status = err.response.status
          return [status, err]
        } else {
          return [0, err]
        }
      })
  }

  const otpVerify = async (params) => {
    return await useJwt
      .otpVerify(params)
      .then((res) => {
        const status = res.status
        return [status, res]
      })
      .catch((err) => {
        if (err.response) {
          const status = err.response.status
          return [status, err]
        } else {
          return [0, err]
        }
      })
  }

  const passwordReset = async (params) => {
    return await useJwt
      .passwordReset(params)
      .then((res) => {
        const status = res.status
        return [status, res]
      })
      .catch((err) => {
        if (err.response) {
          const status = err.response.status
          return [status, err]
        } else {
          return [0, err]
        }
      })
  }

  const callOtpGeneration = async () => {
    const [statusCode, response] = await otpGenerate(params)
    if (resendAttempts < 2) {
      if (statusCode === 200) {
        setEnterPasscode(false)
        setEnterOtp(true)
        toast.success(<Toast msg={response.data.data.result.message} type='success' />, {
          hideProgressBar: true
        })
        setTimerCompleted(false) // Reset timer completion state
        setSeconds(60) // Reset timer
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else {
        toast.warning(<Toast msg={response?.response?.data?.data?.error.detail} type='warning' />, {
          hideProgressBar: true
        })
      }
      setReOtp(reOtp - 1)
    } else {
      toast.warning(<Toast msg={response?.response?.data?.data?.error.detail} type='warning' />, {
        hideProgressBar: true
      })
    }
  }

  const handleGenerateOtp = async (e) => {
    let flag = false
    let _email = email

    if (!email) {
      toast.warning(
        <Toast msg={`Please notice! Email field should not be empty!`} type='warning' />,
        { hideProgressBar: true }
      )
      flag = true
    } else {
      let mail = true

      if (/^[+]{1}(?:[0-9\-\(\)\/\.]\s?){6,12}$/.test(email)) {
        mail = false
      }

      if (/^\d{10}$/.test(email)) {
        mail = false
        _email = `+91${email}`
        setEmail(_email)
      }

      if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) && mail) {
        toast.warning(
          <Toast msg={"Please insert correct email / phone number."} type='warning' />,
          { hideProgressBar: true }
        )
        flag = true
      }
    }

    if (flag) {
      return
    }

    try {
      // setParams({email: email, typ: 'Password change'})
      params.email = _email
      params.typ = "Password change"

      callOtpGeneration()
    } catch (err) {}
  }

  const handleVerifyOtp = async () => {
    params.otp = otp

    const [statusCode, response] = await otpVerify(params)

    if (statusCode === 200) {
      setEnterOtp(false)
      setEnterPasscode(true)
    } else if (statusCode === 401 || statusCode === 403) {
      setLogout(true)
    } else {
      toast.error(<Toast msg={`${response?.response?.data?.data?.error.detail}`} type='danger' />, {
        hideProgressBar: true
      })
    }
  }

  const handlePasswordReset = async () => {
    let flag = false

    if (!/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/.test(passwd)) {
      flag = true
      toast.warning(
        <Toast
          msg='Password must contain a spacial charecter, capital letter, small letter and number must be at lease 6 character.'
          type='warning'
        />,
        { hideProgressBar: true }
      )
    }
    if (passwd !== passwd2) {
      flag = true
      toast.warning(<Toast msg='Password must match.' type='warning' />, { hideProgressBar: true })
    }

    if (flag) {
      return
    }

    params.password = passwd
    params.password2 = passwd2

    const [statusCode, response] = await passwordReset(params)

    if (statusCode === 202) {
      setEnterOtp(false)
      setEnterPasscode(false)
      setParams({})

      history.replace("/login")
    } else if (statusCode === 401 || statusCode === 403) {
      setLogout(true)
    } else {
      toast.warning(<Toast msg='Something went wrong.' type='warning' />, { hideProgressBar: true })
    }
  }

  useEffect(() => {
    if (seconds > 0) {
      const timer = setTimeout(() => {
        setSeconds(seconds - 1)
      }, 1000) // 1000 milliseconds = 1 second

      return () => clearTimeout(timer)
    } else {
      setTimerCompleted(true)
    }
  }, [seconds])

  return (
    <div className='auth-wrapper auth-v2'>
      <Row className='auth-inner m-0'>
        <Link className='brand-logo' to='/' onClick={(e) => e.preventDefault()}>
          <img src={logo_source} alt='Forgot password' />
          <h2 className='brand-text text-primary ml-1 pt-1'>AVDHAAN</h2>
        </Link>
        <Col className='d-none d-lg-flex align-items-center p-5' lg='8' sm='12'>
          <div className='w-100 d-lg-flex align-items-center justify-content-center px-5'>
            <img className='img-fluid' src={source} alt='Forgot password' />
          </div>
        </Col>
        <Col className='d-flex align-items-center auth-bg px-2 p-lg-5' lg='4' sm='12'>
          {enterOtp ? (
            <Col className='px-xl-2 mx-auto' sm='8' md='6' lg='12'>
              <CardTitle tag='h2' className='font-weight-bold mb-1'>
                Enter OTP!
              </CardTitle>
              <CardText className='mb-2'>
                Please insert the OTP that was sent to your email / phone number{" "}
              </CardText>
              <Form id='request_otp' className='auth-forgot-password-form mt-2'>
                <FormGroup>
                  <Label className='form-label' for='login-otp'>
                    OTP
                  </Label>
                  <Input
                    type='text'
                    id='login-otp'
                    placeholder='123456'
                    onChange={(e) => setOtp(e.target.value)}
                    value={otp}
                    autoFocus
                  />
                </FormGroup>
                <Button.Ripple color='primary' block onClick={(e) => handleVerifyOtp(e)}>
                  Verify OTP
                </Button.Ripple>
              </Form>

              {timerCompleted ? (
                <p className='text-center mt-2'>
                  <small
                    className='cursor-pointer align-middle text-danger'
                    // onClick={}
                    onClick={() => {
                      setResendAttempts(resendAttempts + 1)
                      callOtpGeneration()
                    }}
                  >
                    {resendAttempts > 2 ? "" : <h5 className='text-danger'>Resend OTP</h5>}
                  </small>
                </p>
              ) : (
                <p className='text-center mt-2'>
                  <small className='align-middle'>
                    <h5 className='text-danger'>Please wait: {seconds} seconds</h5>
                  </small>
                </p>
              )}
            </Col>
          ) : enterPasscode ? (
            <Col className='px-xl-2 mx-auto' sm='8' md='6' lg='12'>
              <CardTitle tag='h2' className='font-weight-bold mb-1'>
                Reset password!
              </CardTitle>
              <CardText className='mb-2'>
                Please insert password and retype to confirm.
                <p className='m-0 text-danger'>Note:</p>
                <p>
                  Password must contain a spacial charecter, capital letter, small letter and number
                  must be at lease 6 character.
                </p>
              </CardText>
              <Form id='request_otp' className='auth-forgot-password-form mt-2'>
                <FormGroup>
                  <Label className='form-label' for='login-pass'>
                    Password
                  </Label>
                  <Input
                    type='password'
                    id='login-pass'
                    onChange={(e) => setPasswd(e.target.value)}
                    value={passwd}
                    autoFocus
                  />
                </FormGroup>
                <FormGroup>
                  <Label className='form-label' for='login-pass2'>
                    Retype Password
                  </Label>
                  <Input
                    type='password'
                    id='login-pass2'
                    onChange={(e) => setPasswd2(e.target.value)}
                    value={passwd2}
                  />
                </FormGroup>
                <Button.Ripple color='primary' block onClick={(e) => handlePasswordReset(e)}>
                  Reset password
                </Button.Ripple>
              </Form>
            </Col>
          ) : (
            <Col className='px-xl-2 mx-auto' sm='8' md='6' lg='12'>
              <CardTitle tag='h2' className='font-weight-bold mb-1'>
                Forgot Password?
              </CardTitle>
              <CardText className='mb-2'>
                Enter your email(username) / phone number and we'll send you OTP to your registerd
                phone number.
              </CardText>
              <Form id='request_otp' className='auth-forgot-password-form mt-2'>
                <FormGroup>
                  <Label className='form-label' for='login-email'>
                    Email / Phone number
                  </Label>
                  <Input
                    type='text'
                    id='login-email'
                    placeholder='id@example.com'
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    autoFocus
                  />
                </FormGroup>
                <Button.Ripple color='primary' block onClick={(e) => handleGenerateOtp(e)}>
                  Request OTP
                </Button.Ripple>
              </Form>
              <p className='text-center mt-2'>
                <Link to='/login'>
                  <ChevronLeft className='mr-25' size={14} />
                  <span className='align-middle'>Back to login</span>
                </Link>
              </p>
            </Col>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default ForgotPasswordV2
