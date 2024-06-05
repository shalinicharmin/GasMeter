import React from "react"
import { Button } from "antd"
import { Link } from "react-router-dom"
import errorImg from "../assets/images/pages/error.svg"

import "../styles/page-misc.scss"

const Error = () => {
  const logo_source = require("../assets/images/logo/logo.ico").default

  return (
    <div className='misc-wrapper'>
      {/* <a className='brand-logo' href='/'>
        <img src={logo_source} alt='Login V2' />
        <h2 className='brand-text text-primary ml-1 pt-1'>AVDHAAN</h2>
      </a> */}
      <div className='misc-inner  p-sm-3'>
        <div className='w-100 text-center '>
          <h2 className='mb-1'>Page Not Found 🕵🏻‍♀️</h2>
          <p className='mb-3'>Oops! The requested URL was not found on this server.</p>
          <div className='col-lg-12 '>
            <Button type='primary' className='w-25 mb-5'>
              <Link to='/' style={{ textDecoration: "none" }}>
                Back to home
              </Link>
            </Button>
            <img className='img-fluid' src={errorImg} alt='Not authorized page' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Error
