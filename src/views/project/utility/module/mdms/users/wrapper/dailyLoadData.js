import StatsHorizontal from "@components/widgets/stats/StatsHorizontal"
import { Col } from "reactstrap"
import { useState } from "react"
import { ChevronsRight } from "react-feather"

import DailyLoadDataModal from "@src/views/project/utility/module/mdms/users/wrapper/dailyLoadDataModal"

const DailyLoadWrapper = (parms) => {
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
          stats='Daily Load'
          statTitle=''
          clas='h6'
          click={() => setCenteredModal(true)}
        />
      </Col>
      {centeredModal && (
        <DailyLoadDataModal
          title={"Latest Daily Load Information"}
          isOpen={centeredModal}
          handleModalState={setCenteredModal}
        />
      )}
    </div>
  )
}

export default DailyLoadWrapper
