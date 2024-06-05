import { Fragment, useState } from 'react'
import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap'
// import ConnectionDisconnectionReport from './connectionDisconnectionReport'
// import ConnectionDisconnectionReportHistory from './connectionDisconnectionReportHistory'
import CommunicationReport from './communicationReport'
import CommunicationReportHistory from './communicationReportHistory'

const CommunicationReportNav = props => {
  const [active, setActive] = useState('1')

  const toggle = tab => {
    setActive(tab)
  }
  return (
    <Fragment>
      <Nav pills className='justify-content-start '>
        <NavItem>
          <NavLink
            active={active === '1'}
            onClick={() => {
              toggle('1')
            }}>
            Communication Report
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            active={active === '2'}
            onClick={() => {
              toggle('2')
            }}>
            Communication Report History
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent className='py-50' activeTab={active}>
        <TabPane tabId='1'>
          <CommunicationReport dtr_list={props.dtr_list} pss_list={props.pss_list} feeder_list={props.feeder_list} />
        </TabPane>
        <TabPane tabId='2'>
          <CommunicationReportHistory dtr_list={props.dtr_list} pss_list={props.pss_list} feeder_list={props.feeder_list} />
        </TabPane>
      </TabContent>
    </Fragment>
  )
}
export default CommunicationReportNav
