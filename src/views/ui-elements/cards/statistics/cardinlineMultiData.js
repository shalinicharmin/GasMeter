import classnames from 'classnames'
import Avatar from '@components/avatar'
import { Card, CardHeader, CardTitle, CardBody, CardText, Row, Col, Media } from 'reactstrap'
import IcoFun from '@src/utility/dynamicIcon'
import { useSelector } from 'react-redux'

const CardinlineMultiData = props => {
  const iconStore = useSelector(state => state.iconsStore)

  const renderData = () => {

    // console.log("Operational Statistics Data :: ", props.data)

    let data = props.data
    const keyToRemove = 'title';
    const valueToRemove = 'Total Consumption';

    data = data.filter(item => item[keyToRemove] !== valueToRemove)

    
    return data.map((item, index) => {
      const margin = Object.keys(props.cols)
      return (
        <Col key={index} {...props.cols} className='mb-2'>
          <Media className={props.data.length - 1 === index ? 'my-1' : 'my-1 border-right'}>
            <Avatar
              color={iconStore.colors[Math.floor(Math.random() * iconStore.colors.length)]}
              icon={IcoFun(iconStore.icons[Math.floor(Math.random() * iconStore.icons.length)], 24)}
              className='mr-1'
              style={{ cursor: 'default' }}
            />
            <Media className='my-auto' body>
              <h4 className='font-weight-bolder mb-0'>{item.value}</h4>
              <CardText className='font-small-3 mb-0'>{item.title}</CardText>
              {/* <p className='text-right m-0 mr-2 font-size-2'>&#8594;</p> */}
            </Media>
          </Media>
        </Col>
      )
    })
  }

  return (
    <Card className='card-statistics'>
      <CardHeader className='border-bottom p-1'>
        <CardTitle tag='h4'>Operational statistics</CardTitle>
      </CardHeader>
      <CardBody className='p-2'>
        <Row>{renderData()}</Row>
      </CardBody>
    </Card>
  )
}

export default CardinlineMultiData
