import { Fragment, useState } from 'react'
import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap'
import SiteCommandExecutionProgress from './DTRCommandExecution/siteCommandExecutionProgress'
import FeederCommandExecutionProgress from './FeederCommandExecution/feederCommandExecutionProgress'
import MeterCommandExecutionProgress from './MeterCommandExecution/meterCommandExecutionProgress'
import PssCommandExecutionProgress from './PSSCommandExecution/pssCommandExecutionProgress'

const CommandTab = props => {
  const [active, setActive] = useState('1')

  const toggle = tab => {
    setActive(tab)
  }
  return (
    <Fragment>
      <Nav pills className=' '>
        <NavItem>
          <NavLink
            active={active === '1'}
            onClick={() => {
              toggle('1')
            }}>
            Pss
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            active={active === '2'}
            onClick={() => {
              toggle('2')
            }}>
            Feeder
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            active={active === '3'}
            onClick={() => {
              toggle('3')
            }}>
            DTR
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            active={active === '4'}
            onClick={() => {
              toggle('4')
            }}>
            Meter
          </NavLink>
        </NavItem>
      </Nav>

      <TabContent className='py-50' activeTab={active}>
        <TabPane tabId='1'>
          <PssCommandExecutionProgress
            refreshCommandHistory={props.refreshCommandHistory}
            projectName={props.projectName}
            toggleCommandExecutionModal={props.toggleCommandExecutionModal}
            protocolSelectedForCommandExecution={props.protocolSelectedForCommandExecution}
          />
        </TabPane>
        <TabPane tabId='2'>
          <FeederCommandExecutionProgress
            refreshCommandHistory={props.refreshCommandHistory}
            projectName={props.projectName}
            toggleCommandExecutionModal={props.toggleCommandExecutionModal}
            protocolSelectedForCommandExecution={props.protocolSelectedForCommandExecution}
          />
        </TabPane>
        <TabPane tabId='3'>
          <SiteCommandExecutionProgress
            refreshCommandHistory={props.refreshCommandHistory}
            projectName={props.projectName}
            toggleCommandExecutionModal={props.toggleCommandExecutionModal}
            protocolSelectedForCommandExecution={props.protocolSelectedForCommandExecution}
          />
        </TabPane>
        <TabPane tabId='4'>
          <MeterCommandExecutionProgress
            refreshCommandHistory={props.refreshCommandHistory}
            projectName={props.projectName}
            toggleCommandExecutionModal={props.toggleCommandExecutionModal}
            protocolSelectedForCommandExecution={props.protocolSelectedForCommandExecution}
          />
        </TabPane>
      </TabContent>
    </Fragment>
  )
}
export default CommandTab
