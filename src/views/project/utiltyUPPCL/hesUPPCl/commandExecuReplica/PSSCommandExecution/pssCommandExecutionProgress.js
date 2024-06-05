import { useRef, useState } from 'react'
import Wizard from '@components/wizard'

import { FileText, User, MapPin, Link } from 'react-feather'
// import DtrCommand from './dtrCommand'
import { Card } from 'reactstrap'
import PssAsset from './pssAsset'
import PssCommand from './pssCommand'

const PssCommandExecutionProgress = props => {
  const [stepper, setStepper] = useState(null)
  const [tableData, setTableData] = useState([])
  const ref = useRef(null)

  const steps = [
    {
      id: 'account-details',
      title: 'Select Asset',
      subtitle: 'Add Pss and Meter .',
      icon: <FileText size={18} />,
      content: <PssAsset tableData={tableData} setTableData={setTableData} stepper={stepper} type='wizard-modern' />
    },
    {
      id: 'personal-info',
      title: 'Execute Command',
      subtitle: 'Add Protocol and Command',
      icon: <User size={18} />,
      content: (
        <PssCommand
          stepper={stepper}
          type='wizard-modern'
          tableData={tableData}
          setTableData={setTableData}
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

export default PssCommandExecutionProgress
