import React, { useState } from 'react'
import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap'
import RechargeHistory from './wrapper/rechargeHistory'
import ConsumptionHistory from './wrapper/consumptionHistory'
import UserProfile from './wrapper/userProfile'
import CommandHistory from './wrapper/commandHistory'

const MeterProfileTabs = props => {
  // console.log('Row Selected ....')
  // console.log(props.rowSelected)

  const [active, setActive] = useState('1')

  const toggle = tab => {
    setActive(tab)
  }
  return (
    <React.Fragment>
      <Nav pills fill>
        <NavItem>
          <NavLink
            active={active === '1'}
            onClick={() => {
              toggle('1')
            }}>
            Recharge History
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            active={active === '2'}
            onClick={() => {
              toggle('2')
            }}>
            Consumption History
          </NavLink>
        </NavItem>

        {/* <NavItem>
          <NavLink
            active={active === '3'}
            onClick={() => {
              toggle('3')
            }}>
            User Profile
          </NavLink>
        </NavItem> */}
        <NavItem>
          <NavLink
            active={active === '4'}
            onClick={() => {
              toggle('4')
            }}>
            Command History
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent className='py-50' activeTab={active}>
        <TabPane tabId='1'>
          <RechargeHistory rowSelected={props.rowSelected} />
        </TabPane>
        <TabPane tabId='2'>
          <ConsumptionHistory rowSelected={props.rowSelected} />
        </TabPane>
        {/* <TabPane tabId='3'>
          <UserProfile rowSelected={props.rowSelected} />
        </TabPane> */}
        <TabPane tabId='4'>
          <CommandHistory rowSelected={props.rowSelected} />
        </TabPane>
      </TabContent>
    </React.Fragment>
  )
}
export default MeterProfileTabs
