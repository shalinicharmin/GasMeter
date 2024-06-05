import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'
import CreateTable from '@src/views/ui-elements/dtTable/createTable'
import { DollarSign, Link, Link2 } from 'react-feather'
import { useState } from 'react'
import { Col, Modal, ModalBody, ModalHeader, Card, Button, Row } from 'reactstrap'
import CommonSelector from '../Selector/commonSelector'
import RechargeReportNav from '../projectLevelRechargeReportWrapper'
import ConnectionDisconnectionReportNav from '.'

const ConnectionDisconnectionReport = props => {
  const [centeredModal, setCenteredModal] = useState(false)

  return (
    <>
      <Col md='6' xs='12' lg='4' className=' '>
        <StatsHorizontal
          icon={<Link size={21} />}
          color='primary'
          stats='Connection Disconnection Report'
          statTitle=''
          clas='h4'
          click={() => setCenteredModal(true)}
        />
      </Col>
      <Modal isOpen={centeredModal} toggle={() => setCenteredModal(!centeredModal)} className='modal-dialog-centered modal_size'>
        <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>Connection Disconnection Report</ModalHeader>
        <ModalBody>
          {/* <CommonSelector />
          <CreateTable data={data} height='max' rowCount={3} tableName='Recharge Report table' /> */}
          <ConnectionDisconnectionReportNav dtr_list={props.dtr_list} pss_list={props.pss_list} feeder_list={props.feeder_list} />
        </ModalBody>
      </Modal>
    </>
  )
}

export default ConnectionDisconnectionReport
