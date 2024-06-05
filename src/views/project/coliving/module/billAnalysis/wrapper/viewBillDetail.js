import { ArrowRight, Eye, EyeOff } from 'react-feather'
import { Row, Col, Badge } from 'reactstrap'

const BillDetailModal = props => {
  return (
    <Row>
      <Col sm='4' className='recharge-col-height'>
        {Object.keys(props.data).map((item, index) => {
          if (item !== 'bill_url') {
            return (
              <p key={index}>
                <ArrowRight size={14} /> &nbsp; &nbsp; {`${item.charAt(0).toUpperCase()}${item.slice(1)}`.replaceAll('_', ' ')}:{' '}
                <b>
                  {item === 'analysis_status' ? (
                    <Badge color={props.data[item] === 'Pending' ? 'danger' : 'success'} pill className='badge-glow'>
                      {props.data[item]}
                    </Badge>
                  ) : item === 'solution_report' ? (
                    props.data[item] ? (
                      <a href={props.data[item]} target='_blank'>
                        <Eye size={20} />
                      </a>
                    ) : (
                      <EyeOff size={20} />
                    )
                  ) : (
                    props.data[item]
                  )}
                </b>
              </p>
            )
          }
        })}
      </Col>
      <Col sm='8'>
        <iframe src={props.data.bill_url} title='title' className='w-100 h-100'></iframe>
      </Col>
    </Row>
  )
}

export default BillDetailModal
