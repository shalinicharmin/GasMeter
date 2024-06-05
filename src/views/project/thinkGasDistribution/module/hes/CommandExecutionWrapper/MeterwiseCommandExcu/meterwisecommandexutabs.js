import { useRef, useState } from "react"
import Wizard from "@components/wizard"
import { FileText, User, MapPin, Link } from "react-feather"

import MeterAsset from "./meterAsset"
import MeterCommand from "./meterCommand"

const MeterwiseCommandExecutionTabs = (props) => {
  const [stepper, setStepper] = useState(null)
  const [selectedMeterOptions, setSelectedMeterOptions] = useState([])

  const ref = useRef(null)

  const steps = [
    {
      id: "account-details",
      title: "Select Asset",
      subtitle: "Add  Meter .",
      icon: <FileText size={18} />,
      content: (
        <MeterAsset
          stepper={stepper}
          setFetchingData={props.setFetchingData}
          fetchingData={props.fetchingData}
          selectedMeterOptions={selectedMeterOptions}
          setSelectedMeterOptions={setSelectedMeterOptions}
          type='wizard-modern'
        />
      )
    },
    {
      id: "personal-info",
      title: "Execute Command",
      subtitle: "Add Protocol and Command",
      icon: <User size={18} />,
      content: (
        <MeterCommand
          stepper={stepper}
          reloadCommandHistory={props.reloadCommandHistory}
          selectedMeterOptions={selectedMeterOptions}
          toggleCommandExecutionModal={props.toggleCommandExecutionModal}
          type='wizard-modern'
        />
      )
    }
  ]

  return (
    <div className='modern-horizontal-wizard mt-0 pt-0'>
      <Wizard type='modern-horizontal' ref={ref} steps={steps} instance={(el) => setStepper(el)} />
    </div>
  )
}

export default MeterwiseCommandExecutionTabs
