import StatsHorizontal from "@components/widgets/stats/StatsHorizontal"
import { Col } from "reactstrap"
import { useState } from "react"
import { ChevronsRight } from "react-feather"

import PeriodicPushDataModal from "@src/views/project/utility/module/mdms/users/wrapper/periodicPushDataModal"

const PeriodicPushWrapper = (parms) => {
  const [centeredModal, setCenteredModal] = useState(false)

  const handleCenterModalState = (state) => {
    setCenteredModal(state)
  }

  return (
    <div>
      <Col className=' '>
        <StatsHorizontal
          icon={<ChevronsRight size={21} />}
          color='primary'
          stats='Periodic Push'
          statTitle=''
          clas='h6'
          click={() => setCenteredModal(true)}
        />
      </Col>
      {centeredModal && (
        <PeriodicPushDataModal
          title={"Latest Periodic Push Information"}
          isOpen={centeredModal}
          handleModalState={setCenteredModal}
        />
      )}
    </div>
  )
}

export default PeriodicPushWrapper
