import StatsVertical from '@components/widgets/stats/StatsVertical'
import { Col } from 'reactstrap'
import { useState, useContext } from 'react'
import { TrendingUp } from 'react-feather'
// import Chart
import GraphModalWrapper from './graphModalWrapper/graphModalWrapper'

const PfGraphWrapper = parms => {
  const [centeredModal, setCenteredModal] = useState(false)

  const handleCenterModalState = state => {
    setCenteredModal(state)
  }

  return (
    <Col>
      <StatsVertical icon={<TrendingUp size={21} />} color='secondary' stats='PF' statTitle='Know more' click={() => handleCenterModalState(true)} />
      {centeredModal && (
        <GraphModalWrapper
          title={''}
          type={'Power Factor'}
          params={'PF'}
          isOpen={centeredModal}
          handleCenterModalState={handleCenterModalState}
          unitType={''}
        />
      )}
    </Col>
  )
}

export default PfGraphWrapper
