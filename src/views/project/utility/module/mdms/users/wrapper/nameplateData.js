import StatsHorizontal from "@components/widgets/stats/StatsHorizontal"
import { Col } from "reactstrap"
import { useState } from "react"
import { ChevronsRight } from "react-feather"

import NamePlateDataModal from "@src/views/project/utility/module/mdms/users/wrapper/nameplateDataModal"

const NamePlateWrapper = (parms) => {
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
          stats='Name Plate Detail'
          statTitle=''
          clas='h4'
          click={() => setCenteredModal(true)}
        />
      </Col>
      {centeredModal && (
        <NamePlateDataModal
          title={"Name Plate Information"}
          isOpen={centeredModal}
          handleModalState={setCenteredModal}
        />
      )}
    </div>
  )
}

export default NamePlateWrapper
