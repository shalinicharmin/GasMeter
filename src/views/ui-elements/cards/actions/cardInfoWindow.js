import { RefreshCw, AlertTriangle } from 'react-feather'
import { Card, CardBody, Col, Row, Spinner } from 'reactstrap'
import Avatar from '@components/avatar'
import Loader from '@src/views/project/misc/loader'
import useJwt from '@src/auth/jwt/useJwt'
import { useEffect, useState } from 'react'

const cardInfoWindow = props => {
  return (
    <Card className='mb-0 bg-img-top'>
      <CardBody className='p-0 super-center'>
        <Col xs='12' className='border-bottom mb-1'>
          <h5 className='mt-1 text-dark'>
            {props.props.asset_type}
            {'-'}
            {props.props.name}
          </h5>
        </Col>
        <Col xs='12' className='pl-0'>
          {props.props.filter && (
            <ul className='iwul'>
              {props.props.filter.map((val, index) => {
                const key = Object.keys(val)[0]
                return (
                  <li key={index}>
                    {`${key.charAt(0).toUpperCase()}${key.slice(1)}`.replaceAll('_', ' ')} :- <span className='font-weight-bold'>{val[key]}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </Col>
      </CardBody>
    </Card>
  )
}
export default cardInfoWindow
