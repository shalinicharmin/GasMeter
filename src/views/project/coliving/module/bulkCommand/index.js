import { useState } from 'react';
// import StatsHorizontal from '@components/widgets/stats/StatsHorizontal';
// import { Folder } from 'react-feather';
// import { Col, Modal, ModalBody, ModalHeader } from 'reactstrap';
import ViewReport from './viewReport';

function BulkCommand() {
  //   const [centeredModal, setCenteredModal] = useState(false);

  return (
    <>
      {/* <Col md="6" xs="12" lg="4" className=" ">
        <StatsHorizontal
          icon={<Folder size={21} />}
          color="success"
          stats="Bulk Command"
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
          Bulk Command
        </ModalHeader>
        <ModalBody>
          <ViewReport />
        </ModalBody>
      </Modal> */}
      <ViewReport />
    </>
  );
}
export default BulkCommand;
