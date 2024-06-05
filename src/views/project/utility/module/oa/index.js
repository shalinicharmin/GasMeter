import { Users } from 'react-feather'
import { Row, Col } from 'reactstrap'
import StatsVertical from '@components/widgets/stats/StatsVertical'
import Toogleitem from './toogleitem'
import { useState } from 'react'

const index = () => {
  const [infoSelected, setInfoSelected] = useState(false)

  return (
    <>
      <Row>
        {infoSelected ? (
          <Col lg='12'>
            <Toogleitem back={setInfoSelected} />
          </Col>
        ) : (
          // Vms Card
          <Col lg='3'>
            <StatsVertical
              icon={<Users size={21} />}
              color='primary'
              stats=''
              className='cardhover'
              statTitle='Vendor Management system'
              click={setInfoSelected}
            />
          </Col>
        )}
      </Row>
    </>
  )
}

export default index
