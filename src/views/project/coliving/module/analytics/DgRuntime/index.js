import StatsHorizontal from "@components/widgets/stats/StatsHorizontal";
import { ZapOff } from "react-feather";
import { useState } from "react";
import {
  Col,
  Modal,
  ModalBody,
  ModalHeader,
  Card,
  Button,
  Row
} from "reactstrap";
import Report from "./Report";

const DgRuntime = (props) => {
  const [centeredModal, setCenteredModal] = useState(false);
  return (
    <>
      <Col md="6" xs="12" lg="4" className=" ">
        <StatsHorizontal
          icon={<ZapOff size={21} />}
          color="danger"
          stats="DG Runtime"
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
          DG Runtime
        </ModalHeader>
        <ModalBody>
          <Report />
        </ModalBody>
      </Modal>
    </>
  );
};

export default DgRuntime;
