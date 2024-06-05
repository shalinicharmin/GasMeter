import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'
import { Col } from 'reactstrap'
import { useState } from 'react'
import { ChevronRight } from 'react-feather'

import PeriodicDataModal from '@src/views/project/utility/module/mdms/userProfile/wrapper/periodicDataModal'

const PeriodicWrapper = parms => {
  const [centeredModal, setCenteredModal] = useState(false)

  const handleCenterModalState = state => {
    setCenteredModal(state)
  }

  return (
    <div>
      <StatsHorizontal
        icon={<ChevronRight size={21} />}
        color='primary'
        stats='Periodic data'
        statTitle=''
        click={() => setCenteredModal(true)}
        clas='h6'
        avatar={true}
      />
      {centeredModal && <PeriodicDataModal title={'Periodic data table'} isOpen={centeredModal} handleModalState={setCenteredModal} />}
    </div>
  )
}

export default PeriodicWrapper
