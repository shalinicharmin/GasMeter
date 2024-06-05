import StatsVertical from '@components/widgets/stats/StatsVertical'
import { Col } from 'reactstrap'
import { useState, useContext } from 'react'
import { TrendingUp } from 'react-feather'
import GraphModalWrapper from './graphModalWrapper/graphModalWrapper'

const MdGraphWrapper = parms => {
  const [centeredModal, setCenteredModal] = useState(false)

  const handleCenterModalState = state => {
    setCenteredModal(state)
  }

  return (
    <Col>
      <StatsVertical icon={<TrendingUp size={21} />} color='danger' stats='MD' statTitle='Know more' click={() => handleCenterModalState(true)} />
      {centeredModal && (
        <GraphModalWrapper
          title={''}
          type={'Maximum Demand'}
          params={'MD'}
          isOpen={centeredModal}
          handleCenterModalState={handleCenterModalState}
          unitType={'Watt'}
        />
      )}
    </Col>
  )
}

export default MdGraphWrapper
