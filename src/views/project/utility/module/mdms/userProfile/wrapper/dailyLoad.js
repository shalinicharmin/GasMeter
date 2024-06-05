import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'
import { Col } from 'reactstrap'
import { useState } from 'react'
import { ChevronRight } from 'react-feather'

import DailyLoadModal from '@src/views/project/utility/module/mdms/userProfile/wrapper/dailyLoadModal'

const DailyLoad = parms => {
  const [centeredModal, setCenteredModal] = useState(false)

  const handleCenterModalState = state => {
    setCenteredModal(state)
  }

  return (
    <div>
      <StatsHorizontal
        icon={<ChevronRight size={21} />}
        color='primary'
        stats='Daily load'
        statTitle=''
        click={() => setCenteredModal(true)}
        clas='h6'
        avatar={true}
      />
      {centeredModal && <DailyLoadModal title={'Daily load table'} isOpen={centeredModal} handleModalState={setCenteredModal} />}
    </div>
  )
}

export default DailyLoad
