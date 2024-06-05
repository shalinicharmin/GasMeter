import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'
import { Col } from 'reactstrap'
import { useState } from 'react'
import { ChevronsRight } from 'react-feather'
import InstantenousLoadDataModal from './instantenousLoadDataModal'


const InstantenousWrapper = parms => {
  const [centeredModal, setCenteredModal] = useState(false)

  const handleCenterModalState = state => {
    setCenteredModal(state)
  }

  return (
    <div>
      <Col className=' '>
        <StatsHorizontal
          icon={<ChevronsRight size={21} />}
          color='primary'
          stats='Instantaneous Data'
          statTitle=''
          clas='h4'
          click={() => setCenteredModal(true)}
        />
      </Col>
      {centeredModal && <InstantenousLoadDataModal title={'Instantaneous Data Information'} isOpen={centeredModal} handleModalState={setCenteredModal} />}
    </div>
  )
}

export default InstantenousWrapper