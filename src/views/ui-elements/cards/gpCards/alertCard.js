import React, { useState } from 'react'
import { Button, Card, CardBody, CardFooter, ListGroup, ListGroupItem } from 'reactstrap'

const AlertCard = props => {
  const [active, setActive] = useState('1')

  const toggle = tab => {
    if (active !== tab) {
      setActive(tab)
    }
  }
  return (
    <Card className='card-developer-meetup'>
      <CardBody className={`px-0 pb-0 ${props.height} webi_scroller`}>
        <h3 className='text-center mb-1'>Recent top alerts</h3>
        <ListGroup>
          {props.data.map((value, index) => {
            return (
              <ListGroupItem key={index}>
                <div className='d-flex justify-content-between w-100'>
                  <h5 className='mb-1'>{value.title}</h5>
                  <small>{value.date}</small>
                </div>
                <p className='mb-1'>{value.detail}</p>
              </ListGroupItem>
            )
          })}
        </ListGroup>
      </CardBody>
      <CardFooter className='text-center p-1'>
        <Button.Ripple color='flat-primary'>Explore More</Button.Ripple>
      </CardFooter>
    </Card>
  )
}

export default AlertCard
