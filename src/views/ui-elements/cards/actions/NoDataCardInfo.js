import { RefreshCw, AlertTriangle } from 'react-feather'
import { Card, CardBody, Spinner } from 'reactstrap'
import Avatar from '@components/avatar'

const CardInfo = props => {
    return (
        <Card className='bg-white bg-img-top'>
            <CardBody className='super-center'>
                <Avatar color='light-danger' size='xl' icon={<AlertTriangle />} />
                <h4 className='mb-0'>{"No Data Available ..."}</h4>
            </CardBody>
        </Card>
    )
}
export default CardInfo