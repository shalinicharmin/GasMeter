import Avatar from '@components/avatar'
import { Calendar, MapPin, Award } from 'react-feather'
import { Card, CardTitle, CardBody, CardFooter, CardText, Media, Col } from 'reactstrap'
import illustration from '@src/assets/images/illustration/badge.svg'

const CardAllProject = props => {
  const AdditionalInfo = data => {
    return data.map((v, i) => {
      return (
        <Media key={i}>
          <Avatar color='light-primary' className='rounded mr-1' icon={<Calendar size={18} />} />
          <Media body>
            <h6 className='mb-0'>{v.value}</h6>
            <small>{v.title}</small>
          </Media>
        </Media>
      )
    })
  }

  return props.data.map((v, i) => {
    return (
      <Col xxl='3' lg='4' md='6' xs='12' key={i}>
        <Card className='card-developer-meetup'>
          <div className='meetup-img-wrapper rounded-top text-center'>
            <img src={illustration} height='170' />
          </div>
          <CardBody>
            <div className='meetup-header d-flex align-items-center'>
              <div className='meetup-day'>
                <h3 className='mb-0'>{v.operationalMeter}</h3>
              </div>
              <div className='my-auto'>
                <CardTitle tag='h4' className='mb-25'>
                  {v.project}
                </CardTitle>
                <CardText className='mb-0'>Meters are Operational</CardText>
              </div>
            </div>
            {AdditionalInfo(v.additionalInfo)}
          </CardBody>
          <CardFooter>
            <div className='meetup-header d-flex align-items-center mb-0'>
              <div className='meetup-day'>
                <h6 className='mb-0'>Supplied</h6>
                <h3 className='mb-0'>{v.suppliedMeter}</h3>
              </div>
              <div className='meetup-day'>
                <h6 className='mb-0'>Installed</h6>
                <h3 className='mb-0'>{v.installedMeter}</h3>
              </div>
              <div className='my-auto'>
                <h6 className='mb-0'>Down</h6>
                <h3 className='mb-0'>{v.downMeter}</h3>
              </div>
            </div>
          </CardFooter>
        </Card>
      </Col>
    )
  })
}

export default CardAllProject
