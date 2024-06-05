import React, { useState } from 'react'
import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap'
// import CsvData from './csvData'
import MeterConfigTabs from './meterConfigTabs'
import SurveyConfig from './surveyConfig'

const MeterTabs = () => {
  const [active, setActive] = useState('1')

  const toggle = tab => {
    if (active !== tab) {
      setActive(tab)
    }
  }
  return (
    <React.Fragment>
      <Nav className='justify-content-start' tabs>
        <NavItem>
          <NavLink
            active={active === '1'}
            onClick={() => {
              toggle('1')
            }}>
            Survey Configuration
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            active={active === '2'}
            onClick={() => {
              toggle('2')
            }}>
            Meter Configuration
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent className='py-50' activeTab={active}>
        <TabPane tabId='1'>
          <SurveyConfig />
        </TabPane>
        <TabPane tabId='2'>
          <MeterConfigTabs />
        </TabPane>
      </TabContent>
    </React.Fragment>
  )
}
export default MeterTabs
