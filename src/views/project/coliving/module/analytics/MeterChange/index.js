import StatsHorizontal from "@components/widgets/stats/StatsHorizontal";
import { Repeat } from "react-feather";
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

const MeterChange = (props) => {
  const [centeredModal, setCenteredModal] = useState(false);
  return (
    <>
      <Col md="6" xs="12" lg="4" className=" ">
        <StatsHorizontal
          icon={<Repeat size={21} />}
          color="secondary"
          stats="Meter Replacements"
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
          Meter Replacements
        </ModalHeader>
        <ModalBody>
          <Report />
        </ModalBody>
      </Modal>
    </>
  );
};

export default MeterChange;
