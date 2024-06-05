import { Fragment, useState } from 'react'
import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap'
// import RechargeReportHistory from './rechargeReportHistory'
// import RechargeReport from './rechargeReport'
import DeductionReportHistory from './deductionReportHistory'
import DeductionReport from './deductionReport'

const DeductionReportNav = props => {
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
            Deduction Report
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            active={active === '2'}
            onClick={() => {
              toggle('2')
            }}>
            Deduction Report History
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent className='py-50' activeTab={active}>
        <TabPane tabId='1'>
          <DeductionReport dtr_list={props.dtr_list} pss_list={props.pss_list} feeder_list={props.feeder_list} />
        </TabPane>
        <TabPane tabId='2'>
          <DeductionReportHistory dtr_list={props.dtr_list} pss_list={props.pss_list} feeder_list={props.feeder_list} />
        </TabPane>
      </TabContent>
    </Fragment>
  )
}
export default DeductionReportNav
