import StatsVertical from '@components/widgets/stats/StatsVertical'
import { Col } from 'reactstrap'
import { useState } from 'react'
import { TrendingUp } from 'react-feather'
// import Chart
import GraphModalWrapper from './graphModalWrapper/graphModalWrapper'

const PoweGraphWrapper = parms => {
  const [centeredModal, setCenteredModal] = useState(false)

  const handleCenterModalState = state => {
    setCenteredModal(state)
  }

  return (
    <Col>
      <StatsVertical icon={<TrendingUp size={21} />} color='warning' stats='Power' statTitle='Know more' click={() => handleCenterModalState(true)} />
      {centeredModal && (
        <GraphModalWrapper
          title={''}
          type={'Power'}
          params={'POWER'}
          isOpen={centeredModal}
          handleCenterModalState={handleCenterModalState}
          unitType={'Watt'}
        />
      )}
    </Col>
  )
}

export default PoweGraphWrapper
