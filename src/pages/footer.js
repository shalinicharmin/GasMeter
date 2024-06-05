import React from "react"
import { Typography } from "antd"
import "bootstrap/dist/css/bootstrap.min.css"

const { Text, Link } = Typography

const Footer = () => {
  return (
    <div className='d-flex flex-column flex-md-row justify-content-between align-items-center p-3'>
      <div className='d-flex flex-column flex-md-row align-items-center mb-2 mb-md-0'>
        <Text>
          COPYRIGHT © {new Date().getFullYear()}{" "}
          <Link href='https://polarisgrids.com/' target='_blank' rel='noopener noreferrer'>
            Polaris
          </Link>
          <span className='d-none d-sm-inline-block'>, All rights Reserved</span>
        </Text>
      </div>
      <div className='d-flex flex-column flex-md-row align-items-center'>
        <small>
          <Text>
            Version : HES - <span className='text-dark'>1.2</span> | MDMS -{" "}
            <span className='text-dark'>0.0.0.5</span> | Billing System -{" "}
            <span className='text-dark'>0.0.0.5</span> | CIS/CRM -
            <span className='text-dark'>1.9.3</span>
          </Text>
        </small>
      </div>
    </div>
  )
}

export default Footer
