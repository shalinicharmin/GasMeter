import StatsVertical from '@components/widgets/stats/StatsVertical'
import { Col } from 'reactstrap'
import { useState } from 'react'
import { TrendingUp } from 'react-feather'
// import Chart
import GraphModalWrapper from './graphModalWrapper/graphModalWrapper'

const KvarhGraphWrapper = parms => {
  const [centeredModal, setCenteredModal] = useState(false)

  const handleCenterModalState = state => {
    setCenteredModal(state)
  }

  return (
    <Col>
      <StatsVertical icon={<TrendingUp size={21} />} color='info' stats='kVArh' statTitle='Know more' click={() => handleCenterModalState(true)} />
      {centeredModal && (
        <GraphModalWrapper
          title={''}
          type={'kVArh'}
          params={'KVARH'}
          isOpen={centeredModal}
          handleCenterModalState={handleCenterModalState}
          label={'kVArh'}
          unitType={'kVArh'}
        />
      )}
    </Col>
  )
}

export default KvarhGraphWrapper
