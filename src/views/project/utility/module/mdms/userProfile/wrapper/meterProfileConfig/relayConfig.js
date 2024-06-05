import { Fragment } from 'react'
import { ListGroup, ListGroupItem, CustomInput } from 'reactstrap'
import { Check, X } from 'react-feather'

const RelayConfig = props => {
  const Label = () => (
    <Fragment>
      <span className='switch-icon-left'>
        <Check size={14} />
      </span>
      <span className='switch-icon-right'>
        <X size={14} />
      </span>
    </Fragment>
  )

  return (
    <ListGroup>
      <ListGroupItem className='d-flex justify-content-between align-items-center'>
        <span>Cover open event</span>
        <CustomInput type='switch' label={<Label />} className='custom-control-success' id='cover_open' inline />
      </ListGroupItem>
      <ListGroupItem className='d-flex justify-content-between align-items-center'>
        <span>Magenatic event</span>
        <CustomInput type='switch' label={<Label />} className='custom-control-success' id='mag_event' inline />
      </ListGroupItem>
      <ListGroupItem className='d-flex justify-content-between align-items-center'>
        <span>Voltage fluctuation event</span>
        <CustomInput type='switch' label={<Label />} className='custom-control-success' id='vol_event' inline />
      </ListGroupItem>
    </ListGroup>
  )
}

export default RelayConfig
