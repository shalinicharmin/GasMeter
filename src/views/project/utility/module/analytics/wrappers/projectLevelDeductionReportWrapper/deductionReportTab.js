import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'
import CreateTable from '@src/views/ui-elements/dtTable/createTable'
import { TrendingDown } from 'react-feather'
import CommonSelector from '../Selector/commonSelector'
import { useState } from 'react'
import { Col, Modal, ModalBody, ModalHeader, Card, Button, Row } from 'reactstrap'
import DeductionReportNav from '.'

const DeductionReport = props => {
  const [centeredModal, setCenteredModal] = useState(false)

  return (
    <>
      <Col md='6' xs='12' lg='4' className=' '>
        <StatsHorizontal
          icon={<TrendingDown size={21} />}
          color='danger'
          stats='Deduction Report'
          statTitle=''
          clas='h4'
          click={() => setCenteredModal(true)}
        />
      </Col>
      <Modal isOpen={centeredModal} toggle={() => setCenteredModal(!centeredModal)} className='modal-dialog-centered modal_size'>
        <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>Deduction Report</ModalHeader>

        <ModalBody>
          <DeductionReportNav dtr_list={props.dtr_list} pss_list={props.pss_list} feeder_list={props.feeder_list} />
        </ModalBody>
      </Modal>
    </>
  )
}

export default DeductionReport
