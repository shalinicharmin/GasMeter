import { useRef, useState } from 'react'
import Wizard from '@components/wizard'
import { FileText, User, MapPin, Link } from 'react-feather'

import MeterAsset from './meterAsset'
import MeterCommand from './meterCommand'

const MeterCommandExecutionProgress = props => {
  const [stepper, setStepper] = useState(null)
  const [tableData, setTableData] = useState([])
  const ref = useRef(null)

  const steps = [
    {
      id: 'account-details',
      title: 'Select Asset',
      subtitle: 'Add  Meter .',
      icon: <FileText size={18} />,
      content: <MeterAsset stepper={stepper} tableData={tableData} projectName={props.projectName} setTableData={setTableData} type='wizard-modern' />
    },
    {
      id: 'personal-info',
      title: 'Execute Command',
      subtitle: 'Add Protocol and Command',
      icon: <User size={18} />,
      content: (
        <MeterCommand
          stepper={stepper}
          tableData={tableData}
          setTableData={setTableData}
          type='wizard-modern'
          refreshCommandHistory={props.refreshCommandHistory}
          projectName={props.projectName}
          toggleCommandExecutionModal={props.toggleCommandExecutionModal}
          protocolSelectedForCommandExecution={props.protocolSelectedForCommandExecution}
        />
      )
    }
  ]

  return (
    <div className='modern-horizontal-wizard mt-0 pt-0'>
      <Wizard type='modern-horizontal' ref={ref} steps={steps} instance={el => setStepper(el)} />
    </div>
  )
}

export default MeterCommandExecutionProgress
