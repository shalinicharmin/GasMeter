import Avatar from '@components/avatar'
import { MapPin, Clock, Cpu, AlignJustify, Search, Check, User, Package } from 'react-feather'
import { useState, useEffect } from 'react'
import useJwt from '@src/auth/jwt/useJwt'
import Timeline from '@src/views/project/utility/module/oa/wrapper/oaTimeline'

// ** Reactstrap Imports
import { Card, CardHeader, CardTitle, Button, InputGroup, CardText, Row, Col, Media, CardBody, FormGroup, Label, Input, Form } from 'reactstrap'

import authLogout from '../../../../../auth/jwt/logoutlogic'
import { useLocation, useHistory } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

const Assetlifecycle = ({ cols }) => {
  const dispatch = useDispatch()
  const history = useHistory()

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const [inputvalue, setInputValue] = useState('')
  const [response, setResponse] = useState([])
  const [data, setData] = useState([])
  const [meterDetails, setMeterDetails] = useState([])
  const [acknowledgment, setAcknowledgment] = useState('Search Meter with Old Meter Serial')

  //  Asset Info Json
  const MeterDetails = resp => {
    setMeterDetails([
      {
        title: 'Sc Number',
        subtitle: resp[0].meter_details.sc_no,
        color: 'light-primary',
        icon: <MapPin size={24} />
      },

      {
        title: 'Old Meter Serial No.',
        subtitle: resp[0].meter_details.old_meter_serial,
        color: 'light-danger',
        icon: <AlignJustify size={24} />
      },
      {
        title: 'Vendor Name',
        subtitle: resp[0].meter_details.vendor_name,
        color: 'light-info',
        icon: <User size={24} />
      },
      {
        title: 'Meter Type',
        subtitle: resp[0].meter_details.meter_type,
        color: 'light-success',
        icon: <Package size={24} />
      }
    ])
  }

  // function for meter life cycle
  const meterLifeCycle = () => {
    const lifeCycleObjs = data.map(item => {
      return {
        title: item.title,
        content: item.remarks,
        date_time: item.timestamp,
        color: item.status ? 'success' : 'primary',
        icon: <Check size={14} />
      }
    })
    return lifeCycleObjs
  }

  // Api request
  const fetchData = async params => {
    return await useJwt
      .getOldMeterLifeCycle(params)
      .then(res => {
        // console.log(res)
        const status = res.status
        setResponse(res.data)
        MeterDetails(res.data)
        setData(res.data[0].meter_life_cycle)
        setAcknowledgment('No such meter found!')
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

  // rendering data in asset info
  const renderData = () => {
    return meterDetails.map((item, index) => {
      return (
        <Col lg='12' className='pt-0 p' key={index}>
          <Media className='mb-2'>
            <Avatar color={item.color} icon={item.icon} className='mr-2 mb-1  ' />
            <Media className='my-auto' body>
              <h4 className='font-weight-bolder'>{item.title}</h4>
              <CardText className='font-small-3'>{item.subtitle}</CardText>
            </Media>
          </Media>
        </Col>
      )
    })
  }

  //  on input function
  const handleInput = event => {
    setInputValue(event.target.value.trim())
  }

  return (
    <>
      {/* search input  */}
      <Col className='mb-1 px-0' lg='5' md='6'>
        <Form
          onSubmit={event => {
            event.preventDefault()
            fetchData({
              searchQuery: inputvalue
            })
          }}>
          <InputGroup>
            <Input type='text' placeholder='Old Meter Serial...' value={inputvalue} onChange={handleInput} autoFocus={true} />
            <Button type='submit' color='primary' outline>
              Search
            </Button>
          </InputGroup>
        </Form>
      </Col>

      {/*  Asset info */}
      {data.length > 0 ? (
        <Row className='mt-2'>
          <Col lg='4' md='4' className='mb-3'>
            <Card className='card-statistics h-100'>
              <CardHeader className='pb-0'>
                <CardTitle tag='h4'>Asset Information</CardTitle>
              </CardHeader>
              <CardBody className='statistics-body'>
                <Row>{response.length > 0 && renderData()}</Row>
              </CardBody>
            </Card>
          </Col>

          {/* Meter life Cycle */}
          <Col lg='8' md='8' className='mb-3'>
            <Card className='h-100'>
              <CardHeader>
                <CardTitle tag='h4'>Asset Meter Life Cycle</CardTitle>
              </CardHeader>
              <CardBody>
                <Timeline data={meterLifeCycle()} />
              </CardBody>
            </Card>
          </Col>
        </Row>
      ) : (
        <>{acknowledgment}</>
      )}
    </>
  )
}

export default Assetlifecycle
