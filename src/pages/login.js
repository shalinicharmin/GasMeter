import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import classnames from "classnames"
import { Row, Col, CardTitle, CardText, Form, FormGroup, Label, Input, Button } from "reactstrap"
import { useForm } from "react-hook-form"
import { Eye, EyeOff } from "react-feather"

import "../styles/page-auth.scss"
import "../../src/styles/login.scss"
import { login } from "../services/apis/login"
import { jwtDecode } from "jwt-decode"
import { useDispatch } from "react-redux"
import { handleLogin } from "../redux/actions/login"
import { AppstoreOutlined } from "@ant-design/icons"
import { Award, Circle } from "react-feather"
import { setSessionData } from "../redux/actions"
import { message } from "antd"
const Login = () => {
  const [response] = useState()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const {
    register,
    formState: { errors },
    handleSubmit
  } = useForm()
  const { ref: emailRef, ...registerEmail } = register("username", {
    required: true,
    validate: (value) => value !== ""
  })
  const { ref: passwordRef, ...registerPassword } = register("password", {
    required: true,
    validate: (value) => value !== ""
  })
  const [passwordVisible, setPasswordVisible] = useState(false)
  // const { isLoading } = response

  const onSubmit = (data) => {
    login(data)
      .then((response) => {
        if (response?.data?.responseCode === 200) {
          message.success("Login Successful")
          // toast("Login Successfull", { hideProgressBar: true, type: "success" })
          localStorage.setItem("token", response?.data?.data?.result?.access)
          localStorage.setItem("uniqueId", response?.data?.data?.result?.unique_id)
          const data = {
            ...response?.data?.data?.result,
            accessToken: response?.data?.data?.result.access,
            refreshToken: response?.data?.data?.result.refresh
          }

          dispatch(handleLogin(data))
          dispatch(setSessionData(jwtDecode(localStorage.getItem("accessToken")).userData.access))
          navigate("utility/lpdd/hes")
        } else if (response?.isError) {
          // toast("Invalid Credentials", { hideProgressBar: true, type: "error" })
        }
      })
      .catch()
  }

  // const fetchData = async (params) => {
  //   return await useJwt
  //     .getAllProjectSummary(params)
  //     .then((res) => {
  //       const status = res.status
  //       return [status, res]
  //     })
  //     .catch((err) => {
  //       if (err.response) {
  //         const status = err.response.status
  //         return [status, err]
  //       } else {
  //         return [0, err]
  //       }
  //     })
  // }

  return (
    <div className='auth-wrapper auth-v2'>
      <Row className='auth-inner m-0'>
        <Col className='position-absolute'>
          <Link
            className='brand-logo text-decoration-none l-0 d-flex align-items-center '
            to='/'
            onClick={(e) => e.preventDefault()}
          >
            <img src={`logo.svg`} alt='Avdhaan' style={{ height: "40px", width: "40px" }} />
            <h1 className='brand-text ' style={{ color: "#FFFFFF" }}>
              AVDHAAN
            </h1>
          </Link>
        </Col>

        <Col
          className='d-none d-lg-flex align-items-center p-5'
          style={{ backgroundColor: "rgba(10, 54, 144, 1)" }}
          lg='8'
          sm='12'
        >
          <div className='w-100 d-lg-flex align-items-center justify-content-center px-5'>
            <img className='img-fluid' src={"login.svg"} alt='Login V2' />
          </div>
        </Col>

        <Col
          className='d-flex align-items-center background_image auth-bg px-2 p-lg-5'
          lg='4'
          sm='12'
        >
          <Col className='px-xl-2 mx-auto' sm='8' md='6' lg='12'>
            <CardTitle tag='h2' className='font-weight-bold mb-1 color: #0A3690'>
              Welcome to POLARIS!
            </CardTitle>
            <CardText className='mb-2 color: #808080'>Please sign-in to your account.</CardText>
            <Form className='auth-login-form mt-2' onSubmit={handleSubmit(onSubmit)}>
              <FormGroup>
                <Label className='form-label' for='login-email'>
                  Email
                </Label>
                <Input
                  autoFocus
                  type='email'
                  id='login-email'
                  name='login-email'
                  placeholder='user@example.com'
                  className={classnames({
                    "is-invalid": errors["username"]
                  })}
                  innerRef={emailRef}
                  {...registerEmail}
                />
              </FormGroup>

              <FormGroup>
                <div className='d-flex justify-content-between align-items-center'>
                  <Label className='form-label' for='login-password'>
                    Password
                  </Label>
                  <Link className='text-decoration-none' to='/forgot-password'>
                    <small>Forgot Password?</small>
                  </Link>
                </div>
                <div className='position-relative d-flex align-items-center'>
                  <Input
                    type={passwordVisible ? "text" : "password"}
                    id='login-password'
                    name='login-password'
                    placeholder='Enter Password'
                    className={classnames({
                      "is-invalid": errors["password"]
                    })}
                    innerRef={passwordRef}
                    {...registerPassword}
                  />
                  {!errors["password"] && (
                    <>
                      {passwordVisible ? (
                        <EyeOff
                          size={14}
                          className='position-absolute end-0 me-2 cursor-pointer'
                          onClick={() => setPasswordVisible(false)}
                        />
                      ) : (
                        <Eye
                          size={14}
                          className='position-absolute end-0 me-2 cursor-pointer '
                          onClick={() => setPasswordVisible(true)}
                        />
                      )}
                    </>
                  )}
                </div>
              </FormGroup>

              <Button
                type='submit'
                color='primary'
                block
                // disabled={isLoading}
              >
                {/* {isLoading ? ( */}
                {/* <span */}
                {/* className='spinner-border spinner-border-sm'
                  role='status'
                  aria-hidden='true'
                ></span> */}
                sign in
                {/* ) : (
                  "Sign in"
                )} */}
              </Button>
            </Form>
          </Col>
        </Col>
      </Row>
    </div>
  )
}

export default Login
