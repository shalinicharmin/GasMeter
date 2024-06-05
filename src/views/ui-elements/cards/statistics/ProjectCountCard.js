import Avatar from '@components/avatar'
import { Card, CardBody, Media } from 'reactstrap'
import IcoFun from '@src/utility/dynamicIcon'
import illustration from '@src/assets/images/illustration/badge.svg'

import { useSelector } from 'react-redux'

const ProjectCountCard = props => {
  const iconStore = useSelector(state => state.iconsStore)

  return (
    <Card className='card-developer-meetup'>
      <div className='meetup-img-wrapper rounded-top text-center'>
        <img src={illustration} height='170' />
      </div>
      <CardBody>
        {props.data.map((item, index) => (
          <Media key={index}>
            <Avatar
              color='light-primary'
              className='rounded mr-1'
              icon={IcoFun(iconStore.icons[Math.floor(Math.random() * iconStore.icons.length)], 24)}
            />
            <Media body>
              <h6 className='mb-0'>{item.value}</h6>
              <small>{item.title}</small>
            </Media>
          </Media>
        ))}
      </CardBody>
    </Card>
  )
}

export default ProjectCountCard
