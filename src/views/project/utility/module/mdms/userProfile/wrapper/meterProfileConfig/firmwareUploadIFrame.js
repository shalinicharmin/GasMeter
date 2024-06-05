import { useState } from "react"

import Proptypes from "prop-types"
import classnames from "classnames"
import { ChevronUp } from "react-feather"
import {
  Modal,
  ModalHeader,
  ModalBody,
  Collapse,
  Card,
  CardHeader,
  CardBody,
  CardTitle
} from "reactstrap"

import RelayConfig from "@src/views/project/utility/module/mdms/userProfile/wrapper/meterProfileConfig/relayConfig"
import OfflineRecharge from "@src/views/project/utility/module/mdms/userProfile/wrapper/meterProfileConfig/offlineRecharge"
import TariffSlab from "@src/views/project/utility/module/mdms/userProfile/wrapper/meterProfileConfig/tariffSlab"
import OtherMiscConfig from "@src/views/project/utility/module/mdms/userProfile/wrapper/meterProfileConfig/otherMiscConfig"
import UpdateFirmware from "@src/views/project/utility/module/mdms/userProfile/wrapper/meterProfileConfig/updateFirmware"

const FirmwareUploadIFrame = (props) => {
  let data = []

  if (props.consumerType === "POSTPAID") {
    data = [
      // {
      //   title: 'Add / Update tariff slab',
      //   content: <TariffSlab />
      // },
      // {
      //   title: 'Update firmware',
      //   content: <UpdateFirmware />
      // },
      {
        title: "Other MISC. configuration",
        content: <OtherMiscConfig />
      }
    ]
  } else {
    data = [
      {
        title: "Offline recharge",
        content: <OfflineRecharge setIsOpen={props.setIsOpen} isOpen={props.isOpen} />
      },
      {
        title: "Add / Update tariff slab",
        content: <TariffSlab />
      },
      {
        title: "Update firmware",
        content: <UpdateFirmware />
      },
      {
        title: "Other MISC. configuration",
        content: <OtherMiscConfig />
      }
    ]
  }

  const [openCollapse, setOpenCollapse] = useState()

  const handleCollapseToggle = (id) => {
    if (id === openCollapse) {
      setOpenCollapse(null)
    } else {
      setOpenCollapse(id)
    }
  }

  const demos = {
    FirmwareUpload:
      '<iframe src="https://ssh.grampower.com:3001/fwupgrade/" title="Firmware Upload" allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>'
  }

  //codesandbox.io/s/react-iframe-demo-g3vst codePen =
  function Iframe(props) {
    return <div dangerouslySetInnerHTML={{ __html: props.iframe ? props.iframe : "" }} />
  }

  // ** Function to render collapse
  const renderData = () => {
    return (
      <Card className='app-collapse'>
        <CardBody>
          <div className='App'>
            {/* <h1>I frame Demo</h1> */}
            <Iframe iframe={demos["FirmwareUpload"]} allow='autoplay' />,
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Modal
      isOpen={props.isOpen}
      toggle={() => props.setIsOpen(!props.isOpen)}
      scrollable
      className='modal_size'
    >
      <ModalHeader toggle={() => props.setIsOpen(!props.isOpen)}>{props.title}</ModalHeader>
      <ModalBody className='webi_scroller'>{renderData()}</ModalBody>
    </Modal>
  )
}

export default FirmwareUploadIFrame
