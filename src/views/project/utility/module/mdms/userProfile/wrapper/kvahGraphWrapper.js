import StatsVertical from '@components/widgets/stats/StatsVertical'
import { Col } from 'reactstrap'
import { useState } from 'react'
import { TrendingUp } from 'react-feather'
// import Chart
import GraphModalWrapper from './graphModalWrapper/graphModalWrapper'

const KvahGraphWrapper = parms => {
  const [centeredModal, setCenteredModal] = useState(false)

  const handleCenterModalState = state => {
    setCenteredModal(state)
  }

  return (
    <Col>
      <StatsVertical icon={<TrendingUp size={21} />} color='primary' stats='kVAh' statTitle='Know more' click={() => handleCenterModalState(true)} />
      {centeredModal && (
        <GraphModalWrapper
          title={''}
          type={'kVAh'}
          params={'KVAH'}
          isOpen={centeredModal}
          handleCenterModalState={handleCenterModalState}
          label={'kVAh'}
          unitType={'kVAh'}
        />
      )}
    </Col>
  )
}

export default KvahGraphWrapper
