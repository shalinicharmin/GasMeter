// ** Reactstrap Imports
import { Card, CardHeader, CardTitle, CardBody, Row, Col, Input, Form, Button, Label } from 'reactstrap'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import useJwt from '@src/auth/jwt/useJwt'
import Loader from '@src/views/project/misc/loader'

import { ThinkGasMeterInfo } from '@store/actions/UtilityProject/ThinkGasMDMS/MeterInfo'

const MeterInfo = props => {
  const dispatch = useDispatch()
  const responseData = useSelector(state => state.ThinkGasMeterInfoReducer)
  const [loader, setLoader] = useState(false)

  const fetchData = async params => {
    return await useJwt
      .getThinkGasMeterInfo(params)
      .then(res => {
        const status = res.status
        return [status, res]
      })
      .catch(err => {
        const status = 0
        return [status, err]
      })
  }

  useEffect(async () => {
    if (!responseData || !responseData.responseData) {
      //Call API to understand flow
      const params = {
        METER_SERIAL_NUMBER: props.additionalInfo.METER_SERIAL_NUMBER
      }
      const [statusCode, response] = await fetchData(params)

      // console.log('Meter Info')
      // console.log(statusCode)
      // console.log(response)

      if (statusCode === 200) {
        dispatch(ThinkGasMeterInfo(response.data.data.result))
      }
    } else {
    }
  }, [responseData])

  if (!responseData || !responseData.responseData) {
    return <Loader hight='min-height-158' />
  } else if (responseData.responseData.length <= 0) {
    return (
      <Card className='w-100'>
        <CardHeader>
          <CardTitle tag='h4'> Consumer Information</CardTitle>
        </CardHeader>
        <CardBody>
          <h4 className='text-center text-danger mt-2 mb-2'>No records to display</h4>
        </CardBody>
      </Card>
    )
  } else {
    return (
      <Card>
        <CardHeader>
          <CardTitle tag='h4'> Meter Information</CardTitle>
        </CardHeader>
        <CardBody>
          <Form>
            <Row>
              {responseData.responseData.map((obj, index) => {
                return (
                  <Col md='4' sm='12' className='mb-1'>
                    <Label className='form-label' for='nameMulti'>
                      {obj.title}
                    </Label>
                    <Input type='text' name='name' id='nameMulti' value={obj.value} disabled />
                  </Col>
                )
              })}
            </Row>
          </Form>
        </CardBody>
      </Card>
    )
  }
}
export default MeterInfo
