import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'
import { Col } from 'reactstrap'
import { useState } from 'react'
import { ChevronRight } from 'react-feather'

import BlockLoadModal from '@src/views/project/utility/module/mdms/userProfile/wrapper/blockLoadModal'

const BlockLoad = parms => {
  const [centeredModal, setCenteredModal] = useState(false)

  const handleCenterModalState = state => {
    setCenteredModal(state)
  }

  return (
    <div>
      <StatsHorizontal
        icon={<ChevronRight size={21} />}
        color='primary'
        stats='Block load'
        statTitle=''
        click={() => setCenteredModal(true)}
        clas='h6'
        avatar={true}
      />
      {centeredModal && <BlockLoadModal title={'Block load table'} isOpen={centeredModal} handleModalState={setCenteredModal} />}
    </div>
  )
}

export default BlockLoad
