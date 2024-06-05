import { RefreshCw, AlertTriangle } from 'react-feather'
import { Card, CardBody, Spinner, Button } from 'reactstrap'
import Avatar from '@components/avatar'

const CardInfo = props => {
  return (
    <Card>
      <CardBody className='super-center'>
        <Avatar color='light-danger' size='xl' icon={<AlertTriangle />} />
        <h4 className='mb-1'>Network Error Occured 🕵🏻‍♀️</h4>
        <p className='mb-0'>{props.props.message.errorMessage}</p>
        {props.props.retry.retry ? (
          <Spinner color='dark' size='md' />
        ) : (
          <Button.Ripple to='/' color='btn btn-outline-danger' onClick={props.props.retryFun.retryAgain}>
            Retry
            <RefreshCw size='15' className='cursor-pointer mx_5' />
          </Button.Ripple>
        )}
      </CardBody>
    </Card>
  )
}
export default CardInfo
