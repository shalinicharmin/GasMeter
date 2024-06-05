import { Spinner, Card } from 'reactstrap'

const Loader = props => <Card className={`super-center  ${props.hight} ${props.width ? props.width : ''}`}>{<Spinner />}</Card>

export default Loader
