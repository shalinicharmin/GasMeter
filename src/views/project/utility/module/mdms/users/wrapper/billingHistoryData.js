import StatsHorizontal from "@components/widgets/stats/StatsHorizontal"
import { Col } from "reactstrap"
import { useState } from "react"
import { ChevronsRight } from "react-feather"

import BillingHistoryDataModal from "@src/views/project/utility/module/mdms/users/wrapper/billingHistoryDataModal"
// import BillingHistoryDataModal from

const BillingHistoryWrapper = (parms) => {
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
          stats='Billing History'
          statTitle=''
          clas='h6'
          click={() => setCenteredModal(true)}
        />
      </Col>
      {centeredModal && (
        <BillingHistoryDataModal
          title={"Latest Billing History Information"}
          isOpen={centeredModal}
          handleModalState={setCenteredModal}
        />
      )}
    </div>
  )
}

export default BillingHistoryWrapper
