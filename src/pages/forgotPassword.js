import React, { useEffect, useState } from "react"
// import { ChevronLeft, Send } from "react-feather"
import { Link, useNavigate } from "react-router-dom"

// import { Row, Col, CardTitle, CardText, Form, FormGroup, Label, Input, Button } from "reactstrap"
import "../styles/page-auth.scss"
import { toast } from "react-toastify"
import { Row, Col, Card, Form, Input, Button, Typography } from "antd"
// import { Link } from "react-router-dom"
import { LeftOutlined } from "@ant-design/icons"
import { optGenrate } from "../services/apis/auth"

const { Title, Paragraph } = Typography
// import {
//   useGenerateOTPMutation,
//   useVerifyOTPMutation,
//   useChangePasswordMutation
// } from "../api/forgot-passwordSlice"

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [params, setParams] = useState({})
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [passwd, setPasswd] = useState("")
  const [passwd2, setPasswd2] = useState("")
  const [enterOtp, setEnterOtp] = useState(false)
  const [enterPasscode, setEnterPasscode] = useState(false)
  const [reOtp, setReOtp] = useState(2)
  const [logout, setLogout] = useState(false)
  const [seconds, setSeconds] = useState(60)
  const [timerCompleted, setTimerCompleted] = useState(false)
  const [resendAttempts, setResendAttempts] = useState(0)
  // const [generateOtp, response] = useGenerateOTPMutation()
  // const [verifyOTP, verifyOTPResponse] = useVerifyOTPMutation()
  // const [changePassword, changePasswordResponse] = useChangePasswordMutation()

  const handleDataSubmit = () => {
    let flag = false
    let _email = email

    if (!email) {
      toast(`Please notice! Email field should not be empty!`, {
        hideProgressBar: true,
        type: "warning"
      })
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
        toast("Please insert correct email / phone number.", {
          hideProgressBar: true,
          type: "warning"
        })
        flag = true
      }
    }

    if (flag) {
      return
    }

    try {
      params.email = _email
      params.typ = "Password change"

      optGenrate(params)
    } catch (err) {}
  }

  // const handlePasswordReset = async () => {
  //   let flag = false

  //   if (!/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/.test(passwd)) {
  //     flag = true
  //     toast(
  //       "Password must contain a spacial charecter, capital letter, small letter and number must be at lease 6 character.",
  //       { hideProgressBar: true, type: "warning" }
  //     )
  //   }
  //   if (passwd !== passwd2) {
  //     flag = true
  //     toast("Password must match.", { hideProgressBar: true, type: "warning" })
  //   }

  //   if (flag) {
  //     return
  //   }

  //   params.password = passwd
  //   params.password2 = passwd2

  //   changePassword(params)
  // }

  // const handleOtpVerify = () => {
  //   if (otp.length < 1) {
  //     toast("Please enter the OTP", { hideProgressBar: true, type: "warning" })
  //     return
  //   }
  //   params.otp = otp
  //   verifyOTP(params)
  // }

  // useEffect(() => {
  //   const statusCode = changePasswordResponse?.data?.responseCode
  //   if (statusCode === 202) {
  //     setEnterOtp(false)
  //     setEnterPasscode(false)
  //     setParams({})
  //     navigate("/", { replace: true })
  //   } else if (statusCode === 401 || statusCode === 403) {
  //     setLogout(true)
  //   } else if (response.isError) {
  //     toast("Something went wrong.", {
  //       hideProgressBar: true,
  //       type: "warning"
  //     })
  //   }
  // }, [changePasswordResponse])

  // useEffect(() => {
  //   const statusCode = verifyOTPResponse?.data?.responseCode
  //   if (statusCode === 200) {
  //     setEnterOtp(false)
  //     setEnterPasscode(true)
  //   } else if (statusCode === 401 || statusCode === 403) {
  //     setLogout(true)
  //   } else {
  //     toast(verifyOTPResponse?.error?.data?.data?.error?.detail, {
  //       hideProgressBar: true,
  //       type: "error"
  //     })
  //   }
  // }, [verifyOTPResponse])

  // useEffect(() => {
  //   const statusCode = response?.data?.responseCode
  //   if (resendAttempts < 2) {
  //     if (statusCode === 200) {
  //       setEnterPasscode(false)
  //       setEnterOtp(true)
  //       toast(response?.data?.data?.result?.message, {
  //         hideProgressBar: true,
  //         type: "success"
  //       })
  //       setTimerCompleted(false) // Reset timer completion state
  //       setSeconds(60) // Reset timer
  //     } else if (statusCode === 401 || statusCode === 403) {
  //       setLogout(true)
  //     } else {
  //       toast(response?.error?.data?.data?.error?.detail, {
  //         hideProgressBar: true,
  //         type: "error"
  //       })
  //     }
  //     setReOtp(reOtp - 1)
  //   } else {
  //     toast(response?.error?.data?.data?.error?.detail, {
  //       hideProgressBar: true,
  //       type: "error"
  //     })
  //   }
  // }, [response])

  // useEffect(() => {
  //   if (seconds > 0) {
  //     const timer = setTimeout(() => {
  //       setSeconds(seconds - 1)
  //     }, 1000)
  //     return () => clearTimeout(timer)
  //   } else {
  //     setTimerCompleted(true)
  //   }
  // }, [seconds])

  return (
    // <div className='auth-wrapper auth-v2'>
    //   <Row className='auth-inner m-0'>
    //     <Col className='position-absolute'>
    //       <Link
    //         className='brand-logo text-decoration-none l-0 d-flex align-items-center gap-2'
    //         to='/'
    //       >
    //         <img src={"polaris-logo.svg"} alt='Avdhaan' style={{ height: "40px", width: "40px" }} />
    //         <h1 className='brand-text text-primary ml-1 pt-1'>AVDHAAN</h1>
    //       </Link>
    //     </Col>
    //     <Col className='d-none d-lg-flex align-items-center p-5' lg='8' sm='12'>
    //       <div className='w-100 d-lg-flex align-items-center justify-content-center px-5'>
    //         <img className='img-fluid' src={"forgot-password-v2.svg"} alt='Forgot password' />
    //       </div>
    //     </Col>
    //     <Col className='d-flex align-items-center auth-bg px-2 p-lg-5' lg='4' sm='12'>
    //       {enterOtp ? (
    //         <Col className='px-xl-2 mx-auto' sm='8' md='6' lg='12'>
    //           <CardTitle tag='h2' className='font-weight-bold mb-1'>
    //             Enter OTP!
    //           </CardTitle>
    //           <CardText className='mb-2'>
    //             Please insert the OTP that was sent to your email / phone number{" "}
    //           </CardText>
    //           <Form id='request_otp' className='auth-forgot-password-form mt-2'>
    //             <FormGroup>
    //               <Label className='form-label' for='login-otp'>
    //                 OTP
    //               </Label>
    //               <Input
    //                 type='text'
    //                 id='login-otp'
    //                 placeholder='123456'
    //                 onChange={(e) => setOtp(e.target.value)}
    //                 value={otp}
    //                 autoFocus
    //               />
    //             </FormGroup>
    //             <Button color='primary' block onClick={handleOtpVerify}>
    //               Verify OTP
    //             </Button>
    //           </Form>

    //           {timerCompleted ? (
    //             <p className='text-center mt-2'>
    //               <small
    //                 className='cursor-pointer align-middle text-danger'
    //                 onClick={() => {
    //                   setOtp("")
    //                   setResendAttempts(resendAttempts + 1)
    //                   generateOtp(params)
    //                 }}
    //               >
    //                 {resendAttempts > 2 ? (
    //                   ""
    //                 ) : (
    //                   <h5 className='text-danger cursor-pointer'>Resend OTP</h5>
    //                 )}
    //               </small>
    //             </p>
    //           ) : (
    //             <p className='text-center mt-2'>
    //               <small className='align-middle'>
    //                 <h5 className='text-danger'>Please wait: {seconds} seconds</h5>
    //               </small>
    //             </p>
    //           )}
    //         </Col>
    //       ) : enterPasscode ? (
    //         <Col className='px-xl-2 mx-auto' sm='8' md='6' lg='12'>
    //           <CardTitle tag='h2' className='font-weight-bold mb-1'>
    //             Reset password!
    //           </CardTitle>
    //           <CardText className='mb-2'>
    //             Please insert password and retype to confirm.
    //             <p className='m-0 text-danger'>Note:</p>
    //             <p>
    //               Password must contain a spacial charecter, capital letter, small letter and number
    //               must be at lease 6 character.
    //             </p>
    //           </CardText>
    //           <Form id='request_otp' className='auth-forgot-password-form mt-2'>
    //             <FormGroup>
    //               <Label className='form-label' for='login-pass'>
    //                 Password
    //               </Label>
    //               <Input
    //                 type='password'
    //                 id='login-pass'
    //                 onChange={(e) => setPasswd(e.target.value)}
    //                 value={passwd}
    //                 autoFocus
    //               />
    //             </FormGroup>
    //             <FormGroup>
    //               <Label className='form-label' for='login-pass2'>
    //                 Retype Password
    //               </Label>
    //               <Input
    //                 type='password'
    //                 id='login-pass2'
    //                 onChange={(e) => setPasswd2(e.target.value)}
    //                 value={passwd2}
    //               />
    //             </FormGroup>
    //             <Button color='primary' block onClick={handlePasswordReset}>
    //               Reset password
    //             </Button>
    //           </Form>
    //         </Col>
    //       ) : (
    //         <Col className='px-xl-2 mx-auto' sm='8' md='6' lg='12'>
    //           <CardTitle tag='h2' className='font-weight-bold mb-1'>
    //             Forgot Password?
    //           </CardTitle>
    //           <CardText className='mb-2'>
    //             Enter your email(username) / phone number and we'll send you OTP to your registerd
    //             phone number.
    //           </CardText>
    //           <Form id='request_otp' className='auth-forgot-password-form mt-2'>
    //             <FormGroup>
    //               <Label className='form-label' for='login-email'>
    //                 Email / Phone number
    //               </Label>
    //               <Input
    //                 type='text'
    //                 id='login-email'
    //                 placeholder='id@example.com'
    //                 onChange={(e) => setEmail(e.target.value)}
    //                 value={email}
    //                 autoFocus
    //               />
    //             </FormGroup>
    //             <Button color='primary' block onClick={handleDataSubmit}>
    //               Request OTP
    //             </Button>
    //           </Form>
    //           <p className='text-center mt-2'>
    //             <Link className='text-decoration-none' to='/'>
    //               <ChevronLeft className='mr-25' size={14} />
    //               <span className='align-middle text-decoration-none'>Back to login</span>
    //             </Link>
    //           </p>
    //         </Col>
    //       )}
    //     </Col>
    //   </Row>
    // </div>
    <div className='auth-wrapper auth-v2'>
      <Row className='auth-inner m-0'>
        <Col xs={24} sm={16} md={12} lg={32} className='position-absolute'>
          <Link
            className='brand-logo text-decoration-none l-0 d-flex align-items-center gap-2'
            to='/'
          >
            <img src={"polaris-logo.svg"} alt='Avdhaan' style={{ height: "40px", width: "40px" }} />
            <h1 className='brand-text text-primary ml-1 pt-1'>AVDHAAN</h1>
          </Link>
        </Col>
        <Col className='d-none d-lg-flex align-items-center p-5' lg='8' sm='12'>
          <div className='w-100 d-lg-flex align-items-center justify-content-center px-5'>
            <img className='img-fluid' src={"forgot-password-v2.svg"} alt='Forgot password' />
          </div>
        </Col>
        <Col className='d-flex align-items-center auth-bg px-2 p-lg-5' lg='4' sm='12'>
          {enterOtp ? (
            <Col className='px-xl-2 mx-auto' sm='8' md='6' lg='12'>
              <Card title='Enter OTP!' className='font-weight-bold mb-1'>
                <Paragraph className='mb-2'>
                  Please insert the OTP that was sent to your email / phone number{" "}
                </Paragraph>
                <Form id='request_otp' className='auth-forgot-password-form mt-2'>
                  <Form.Item label='OTP'>
                    <Input
                      type='text'
                      id='login-otp'
                      placeholder='123456'
                      onChange={(e) => setOtp(e.target.value)}
                      value={otp}
                      autoFocus
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button type='primary' block onClick={handleOtpVerify}>
                      Verify OTP
                    </Button>
                  </Form.Item>
                </Form>
                {timerCompleted ? (
                  <div className='text-center mt-2'>
                    <small
                      className='cursor-pointer align-middle text-danger'
                      onClick={() => {
                        setOtp("")
                        setResendAttempts(resendAttempts + 1)
                        generateOtp()
                      }}
                    >
                      {resendAttempts > 2 ? (
                        ""
                      ) : (
                        <h5 className='text-danger cursor-pointer'>Resend OTP</h5>
                      )}
                    </small>
                  </div>
                ) : (
                  <div className='text-center mt-2'>
                    <small className='align-middle'>
                      <h5 className='text-danger'>Please wait: {seconds} seconds</h5>
                    </small>
                  </div>
                )}
              </Card>
            </Col>
          ) : enterPasscode ? (
            <Col className='px-xl-2 mx-auto' sm='8' md='6' lg='12'>
              <Card title='Reset password!' className='font-weight-bold mb-1'>
                <Paragraph className='mb-2'>
                  Please insert password and retype to confirm.
                  <p className='m-0 text-danger'>Note:</p>
                  <p>
                    Password must contain a special character, capital letter, small letter, and
                    number must be at least 6 characters.
                  </p>
                </Paragraph>
                <Form id='request_otp' className='auth-forgot-password-form mt-2'>
                  <Form.Item label='Password'>
                    <Input
                      type='password'
                      id='login-pass'
                      onChange={(e) => setPasswd(e.target.value)}
                      value={passwd}
                      autoFocus
                    />
                  </Form.Item>
                  <Form.Item label='Retype Password'>
                    <Input
                      type='password'
                      id='login-pass2'
                      onChange={(e) => setPasswd2(e.target.value)}
                      value={passwd2}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button type='primary' block onClick={handlePasswordReset}>
                      Reset password
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          ) : (
            <Col xs={12} sm={8} md={6} lg={12} className='px-xl-2 mx-auto'>
              <Title level={2} className='font-weight-bold mb-1'>
                <Link className='text-decoration-none' to='/forgot-password'>
                  <small>Forgot Password?</small>
                </Link>
              </Title>
              <Paragraph className='mb-2'>
                Enter your email(username) / phone number and we'll send you OTP to your registered
                phone number.
              </Paragraph>
              <Form id='request_otp' className='auth-forgot-password-form mt-2'>
                <Form.Item label='Email / Phone number'>
                  <Input
                    type='text'
                    id='login-email'
                    placeholder='id@example.com'
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    autoFocus
                  />
                </Form.Item>
                <Form.Item>
                  <Button type='primary' block onClick={handleDataSubmit}>
                    Request OTP
                  </Button>
                </Form.Item>
              </Form>
              <div className='text-center mt-2'>
                <Link className='text-decoration-none' to='/'>
                  <LeftOutlined className='mr-25' size={14} />
                  <span className='align-middle text-decoration-none'>Back to login</span>
                </Link>
              </div>
            </Col>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default ForgotPassword
