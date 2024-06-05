import { useState, useContext, Fragment } from "react"
import classnames from "classnames"
import Avatar from "@components/avatar"
import { useSkin } from "@hooks/useSkin"
import useJwt from "@src/auth/jwt/useJwt"
import { useDispatch, useSelector } from "react-redux"
import { useForm } from "react-hook-form"
import { toast, Slide } from "react-toastify"
import { handleLogin } from "@store/actions/auth"
import { AbilityContext } from "@src/utility/context/Can"
import { Link, useHistory } from "react-router-dom"
import InputPasswordToggle from "@components/input-password-toggle"
import { getHomeRouteForLoggedInUser, isObjEmpty } from "@utils"
import { Facebook, Twitter, Mail, GitHub, HelpCircle, Coffee } from "react-feather"
import {
  Alert,
  Row,
  Col,
  CardTitle,
  CardText,
  Form,
  Input,
  FormGroup,
  Label,
  CustomInput,
  Button,
  UncontrolledTooltip
} from "reactstrap"
import "@styles/base/pages/page-auth.scss"

import jwt_decode from "jwt-decode"
import { encryptDataUsingPublicKey } from "../../utility/Utils"
import Toast from "@src/views/ui-elements/cards/actions/createToast"

const ToastContent = ({ name, role }) => (
  <Fragment>
    <div className='toastify-header'>
      <div className='title-wrapper'>
        <Avatar size='sm' color='warning' icon={<Coffee size={12} />} />
        <h6 className='toast-title font-weight-bold'>Welcome, {name}</h6>
      </div>
    </div>
    <div className='toastify-body'>
      <span>You have successfully logged in as an {role} user to AVDHAAN!</span>
    </div>
  </Fragment>
)

const ErrorToastMessage = ({ msg }) => {
  // Log msg to the console
  return (
    <Fragment>
      <div className='toastify-header'>
        <div className='title-wrapper'>
          <Avatar size='sm' color='danger' icon={<HelpCircle size={12} />} />
          <h6 className='toast-title font-weight-bold'>Error</h6>
        </div>
      </div>
      <div className='toastify-body'>
        <span>{msg}</span>
      </div>
    </Fragment>
  )
}

const Login = (props) => {
  const config = useJwt.jwtConfig

  const [skin, setSkin] = useSkin()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch()
  const history = useHistory()
  const [username, setEmail] = useState("admin@demo.com")
  const [password, setPassword] = useState("admin")
  const [isSigningIn, setIsSigningIn] = useState(false)

  const publicApiKey = useSelector((state) => state.auth.publicApiKey)

  const { register, errors, handleSubmit } = useForm()
  const illustration = skin === "dark" ? "login-v2-dark.svg" : "login-v2.svg",
    source = require(`@src/assets/images/pages/${illustration}`).default,
    logo_source = require("@src/assets/images/logo/logo.ico").default

  const onSubmit = async (data) => {
    //public api key has to be present
    if (!publicApiKey) {
      toast.error(<Toast msg='Public API Key not present' type='danger' />, {
        hideProgressBar: true
      })
      return
    }

    if (isObjEmpty(errors)) {
      setIsSigningIn(true)

      //encrypting user data using public api key before passing it to login api
      const userData = { username, password }
      const encResponse = await encryptDataUsingPublicKey(publicApiKey, userData)
      if (!encResponse || !encResponse.success) {
        toast.error(<Toast msg='Failed to encrypted sensitive data' type='danger' />, {
          hideProgressBar: true
        })
        setIsSigningIn(false)
        return
      }

      useJwt
        .login({ eData: encResponse.data })
        .then((res) => {
          const userData_local = jwt_decode(res.data.data.result.access).userData

          const data = {
            ...userData_local,
            accessToken: res.data.data.result.access,
            refreshToken: res.data.data.result.refresh,
            unique_id: res.data.data.result.unique_id
          }
          // console.log(res)
          dispatch(handleLogin(data))
          ability.update(userData_local.ability)
          history.push(getHomeRouteForLoggedInUser(data.role))
          // toast.success(<ToastContent name={data.fullName || data.username || 'Grampower'} role={data.role || 'admin'} />, {
          //   transition: Slide,
          //   hideProgressBar: true,
          //   autoClose: 2000
          // })
          setIsSigningIn(false)
        })

        .catch(function (error) {
          // console.log(error.response.status) // 401
          // console.log(error.response.data.data.error.detail)
          // console.log(error?.response?.data?.data?.result?.detail) //Please Authenticate or whatever returned from server

          const errorMessage =
            error?.response?.data?.data?.result?.detail ||
            error?.response?.data?.data?.error?.detail
          if (error.response.status === 401) {
            toast.error(<ErrorToastMessage msg={errorMessage} />, {
              transition: Slide,
              hideProgressBar: true,
              autoClose: 2000
            })
          }
          setIsSigningIn(false)
        })
    }
  }

  return (
    <div className='auth-wrapper auth-v2'>
      <Row className='auth-inner m-0'>
        <Link className='brand-logo' to='/' onClick={(e) => e.preventDefault()}>
          <img src={logo_source} alt='Forgot password' />
          <h2 className='brand-text text-primary ml-1 pt-1'>AVDHAAN</h2>
        </Link>
        <Col className='d-none d-lg-flex align-items-center p-5' lg='8' sm='12'>
          <div className='w-100 d-lg-flex align-items-center justify-content-center px-5'>
            <img className='img-fluid' src={source} alt='Login V2' />
          </div>
        </Col>
        <Col className='d-flex align-items-center auth-bg px-2 p-lg-5' lg='4' sm='12'>
          <Col className='px-xl-2 mx-auto' sm='8' md='6' lg='12'>
            <CardTitle tag='h2' className='font-weight-bold mb-1'>
              Welcome to Grampower!
            </CardTitle>
            <CardText className='mb-2'>Please sign-in to your account.</CardText>
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
                  onChange={(e) => setEmail(e.target.value)}
                  className={classnames({
                    "is-invalid": errors["login-email"]
                  })}
                  innerRef={register({
                    required: true,
                    validate: (value) => value !== ""
                  })}
                />
              </FormGroup>
              <FormGroup>
                <div className='d-flex justify-content-between'>
                  <Label className='form-label' for='login-password'>
                    Password
                  </Label>
                  <Link to='/forgot-password'>
                    <small>Forgot Password?</small>
                  </Link>
                </div>
                <InputPasswordToggle
                  id='login-password'
                  name='login-password'
                  // className='input-group-merge'
                  onChange={(e) => setPassword(e.target.value)}
                  className={classnames({
                    "is-invalid": errors["login-password"]
                  })}
                  innerRef={register({
                    required: true,
                    validate: (value) => value !== ""
                  })}
                />
              </FormGroup>
              <FormGroup>
                <CustomInput
                  type='checkbox'
                  className='custom-control-Primary'
                  id='remember-me'
                  label='Remember Me'
                />
              </FormGroup>
              <Button.Ripple type='submit' color='primary' block disabled={isSigningIn}>
                {isSigningIn ? (
                  <span
                    className='spinner-border spinner-border-sm'
                    role='status'
                    aria-hidden='true'
                  ></span>
                ) : (
                  "Sign in"
                )}
              </Button.Ripple>
            </Form>
          </Col>
        </Col>
      </Row>
    </div>
  )
}

export default Login
