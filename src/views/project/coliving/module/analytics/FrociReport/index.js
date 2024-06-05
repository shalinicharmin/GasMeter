import StatsHorizontal from '@components/widgets/stats/StatsHorizontal';
import { FileText, AlertTriangle } from 'react-feather';
import { useState } from 'react';
import {
  Col,
  Modal,
  ModalBody,
  ModalHeader,
  Card,
  Button,
  Row
} from 'reactstrap';
import Report from './Report';

const FrociReport = (props) => {
  const [centeredModal, setCenteredModal] = useState(false);
  return (
    <>
      <Col md="6" xs="12" lg="4" className=" ">
        <StatsHorizontal
          icon={<AlertTriangle size={21} />}
          color="warning"
          stats="Forcefully Relay Off But Consumption Increasing"
          statTitle=""
          clas="h4"
          click={() => setCenteredModal(true)}
        />
      </Col>
      <Modal
        isOpen={centeredModal}
        toggle={() => setCenteredModal(!centeredModal)}
        className="modal-dialog-centered modal_size"
      >
        <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>
          Forcefully Relay Off But Consumption Increasing
        </ModalHeader>
        <ModalBody>
          <Report />
        </ModalBody>
      </Modal>
    </>
  );
};

export default FrociReport;
