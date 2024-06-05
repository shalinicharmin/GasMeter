import { ListGroup, ListGroupItem } from 'reactstrap'
import IcoFun from '@src/utility/dynamicIcon'

const ListWrapper = props => {
  return (
    <ListGroup tag='div' className='list-group-horizontal mb-2'>
      <ListGroupItem tag='a' href='#' className='d-flex'>
        <span className='mr-1'>{IcoFun('TrendingUp', 16)}</span>
        <span>Explore prepaid ledger</span>
      </ListGroupItem>
      <ListGroupItem tag='a' href='#' className='d-flex'>
        <span className='mr-1'>{IcoFun('FileText', 16)}</span>
        <span>Check generated bills</span>
      </ListGroupItem>
      <ListGroupItem tag='a' href='#' className='d-flex'>
        <span className='mr-1'>{IcoFun('Image', 16)}</span>
        <span>Check asset image</span>
      </ListGroupItem>
    </ListGroup>
  )
}

export default ListWrapper
