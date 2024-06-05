import StatsHorizontal from "@components/widgets/stats/StatsHorizontal"
import { Col, Modal, ModalHeader, ModalBody } from "reactstrap"
import { useState } from "react"
import { ChevronRight } from "react-feather"

import InstantBillDetermine from "@src/views/project/utility/module/mdms/userProfile/wrapper/instantBillDetermine"
import BillDetermine from "@src/views/project/utility/module/mdms/userProfile/wrapper/billDetermine"
import CommandHistory from "@src/views/project/utility/module/hes/wrappers/commandHistory"

const MonthlyBillDetermine = (parms) => {
  const [centeredModal, setCenteredModal] = useState(false)
  const [reloadCommandHistory, setReloadCommandHistory] = useState(false)

  const [startDateTime, setStartDateTime] = useState(undefined)
  const [startDateTimeAsPerFormat, setStartDateTimeAsPerFormat] = useState(undefined)

  const [endDateTime, setEndDateTime] = useState(undefined)
  const [endDateTimeAsPerFormat, setEndDateTimeAsPerFormat] = useState(undefined)

  const doNotRefreshCommandHistory = () => {
    setReloadCommandHistory(false)
  }

  return (
    <div>
      <StatsHorizontal
        icon={<ChevronRight size={21} />}
        color='primary'
        stats='Monthly bill determinant'
        statTitle=''
        click={() => setCenteredModal(true)}
        clas='h6'
        avatar={true}
      />
      {centeredModal && (
        <Modal
          isOpen={centeredModal}
          toggle={() => setCenteredModal(!centeredModal)}
          scrollable
          className='modal_size'
        >
          <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>
            Monthly bill determinant table
          </ModalHeader>
          <ModalBody className='webi_scroller'>

            <BillDetermine title='Monthly billing determinant' txtLen={10} />
            {/* <InstantBillDetermine reloadCommandHistory1={reloadCommandHistory} doNotRefreshCommandHistory={doNotRefreshCommandHistory} txtLen={12} /> */}
          </ModalBody>
        </Modal>
      )}
    </div>
  )
}

export default MonthlyBillDetermine
