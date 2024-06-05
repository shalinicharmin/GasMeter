import React, { useState } from 'react'
import classnames from 'classnames'
import { TabContent, TabPane, Nav, NavItem, NavLink, Dropdown, DropdownItem, DropdownToggle, DropdownMenu } from 'reactstrap'
import { AlertTriangle, DollarSign, FileText, Home, XCircle, Zap } from 'react-feather'
import RechargeReportNav from './RechargeReportWrapper/index'
import BillReportWrapper from './BillReportWrapper'
import IllegalConsumption from './IllegalConsumption'
import PowerConsumption from './PowerConsumptionReportwrapper'

const ReportSection = () => {
  const [active, setActive] = useState('1')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen)

  const toggle = tab => {
    setActive(tab)
  }
  return (
    <React.Fragment>
      <h4 className='mb-2'>Reports-Section</h4>
      <Nav tabs justified>
        <NavItem>
          <NavLink
            active={active === '1'}
            onClick={() => {
              toggle('1')
            }}>
            <DollarSign size={18} className='m-0' />
            <span className='align-middle mx-0'> Recharge</span>
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            active={active === '2'}
            onClick={() => {
              toggle('2')
            }}>
            <FileText size={18} />
            <span className='align-middle'> Bills</span>
          </NavLink>
        </NavItem>

        <NavItem>
          <NavLink
            active={active === '3'}
            onClick={() => {
              toggle('3')
            }}>
            <AlertTriangle size={18} />
            <span className='align-middle'> Illegal Consumption</span>
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            active={active === '4'}
            onClick={() => {
              toggle('4')
            }}>
            <Zap size={18} />
            Power Consumption
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent className='py-50' activeTab={active}>
        <TabPane tabId='1'>
          <RechargeReportNav />
        </TabPane>
        <TabPane tabId='2'>
          <BillReportWrapper />
        </TabPane>
        <TabPane tabId='3'>
          <IllegalConsumption />
        </TabPane>
        <TabPane tabId='4'>
          <PowerConsumption />
        </TabPane>
      </TabContent>
    </React.Fragment>
  )
}
export default ReportSection
