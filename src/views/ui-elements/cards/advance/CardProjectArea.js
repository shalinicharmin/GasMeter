import { Card, CardBody, CardText, Row, Col, Media } from 'reactstrap'
import Avatar from '@components/avatar'
import IcoFun from '@src/utility/dynamicIcon'

import { useSelector } from 'react-redux'

const CardProjectArea = props => {
  const iconStore = useSelector(state => state.iconsStore)

  return (
    <Card className='card-congratulations-medal'>
      <CardBody className='text-center'>
        <h4 className='text-left'>Project Area</h4> <hr />
        <Row>
          {props.data.map((item, index) => (
            <Col lg='6' md='4' sm='6' className='mb-1' key={index}>
              <Media>
                <Avatar
                  color={iconStore.colors[Math.floor(Math.random() * iconStore.colors.length)]}
                  icon={IcoFun(iconStore.icons[Math.floor(Math.random() * iconStore.icons.length)], 24)}
                  className='mr-2'
                />
                <Media className='my-auto' body>
                  <h4 className='font-weight-bolder mb-0'>{item.value}</h4>
                  <CardText className='font-small-3 mb-0'>{item.title}</CardText>
                </Media>
              </Media>
            </Col>
          ))}
          <Col></Col>
        </Row>
        {/* <h6 className='text-right'>Last Updated : 14 Feb 2022</h6> */}
      </CardBody>
    </Card>
  )
}

export default CardProjectArea
