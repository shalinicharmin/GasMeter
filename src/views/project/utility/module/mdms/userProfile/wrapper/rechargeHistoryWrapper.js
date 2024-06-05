import { Card, CardHeader, CardBody, Badge } from 'reactstrap'
import { Check } from 'react-feather'
import Avatar from '@components/avatar'

// import { useRef } from 'react'


const RawFun = props => {

  return props.data.map((i, index) => (
    <Card onClick={() => props.handleRechargeItemClicked(index)} className='cursor-pointer' key={index}>
      <CardHeader>
        <span className='float-left font-weight-bolder'>
          {i.date}, &nbsp; {i.time}
        </span>
        <span className='float-right'>
          <Badge color='light-primary'>Rs. {i.amount}</Badge>
        </span>
      </CardHeader>
      <CardBody className=''>
        <div className='d-flex justify-content-between align-items-center'>
          <div>
            <p className={`mb-0`}>Receipt Number: {i.receipt}</p>
            <div className='card-text mb-0'>
              <Avatar color={i.status === 'success' ? 'light-success' : 'light-danger'} icon={<Check size={14} />} />
              <span className='ml_10'>{i.message}</span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  ))
}

export default RawFun
