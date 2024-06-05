import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import classnames from "classnames"
import { Row, Col, Card, Typography, Form, Input, Button, message } from "antd"
import { useForm } from "react-hook-form"
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons"

import "../styles/page-auth.scss"
import "../../src/styles/login.scss"
import { login } from "../services/apis/auth"
import { jwtDecode } from "jwt-decode"
import { useDispatch } from "react-redux"
import { handleLogin } from "../redux/actions/login"

import { setSessionData } from "../redux/actions"

const { Title, Text } = Typography

const Login = () => {
  const [response] = useState()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [data, setData] = useState()
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
    console.log(data)
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

  const onFinish = (values) => {
    onSubmit(values);
  };

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
            <Title level={1} className='brand-text' style={{ color: "#FFFFFF", wordBreak: 'normal' }}>
              AVDHAAN
            </Title>
          </Link>
        </Col>

        <Col
          className='d-none d-lg-flex align-items-center p-5'
          style={{ backgroundColor: "rgba(10, 54, 144, 1)" }}
          lg={16}
          sm={12}
        >
          <div className='w-100 d-lg-flex align-items-center justify-content-center px-5'>
            <img className='img-fluid' src={"login.svg"} alt='Login V2' />
          </div>
        </Col>

        <Col
          className='d-flex align-items-center background_image auth-bg px-2 p-lg-5'
          lg={8}
          sm={12}
        >
          <Col className='px-xl-2 mx-auto' sm={16} md={12} lg={24}>
            <Card>
              <Title level={2} className='font-weight-bold mb-1' style={{ color: "#0A3690" }}>
                Welcome to POLARIS!
              </Title>
              <Text className='mb-2' style={{ color: "#808080" }}>
                Please sign-in to your account.
              </Text>
              <Form
                className='auth-login-form mt-2'
                onFinish={(data) => onFinish(data)}
              >
                <Form.Item
                  name='username'
                  rules={[{ required: true, message: "Please input your Email!" }]}
                >
                  <Input autoFocus type='email' placeholder='user@example.com' />
                </Form.Item>

                <Form.Item
                  name='password'
                  rules={[{ required: true, message: "Please input your Password!" }]}
                >
                  <Input.Password
                    placeholder='Enter Password'
                    iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>

                <Form.Item>
                  <Link className='text-decoration-none' to='/forgot-password'>
                    <small>Forgot Password?</small>
                  </Link>
                </Form.Item>

                <Form.Item>
                  <Button type='primary' htmlType='submit' block>
                    Sign In
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Col>
      </Row>
    </div>
  )
}

export default Login
