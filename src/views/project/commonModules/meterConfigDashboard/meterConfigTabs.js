import React, { useState } from 'react'
import { TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, Card } from 'reactstrap'
import ManuallyAddMeter from './manuallyAddMeter'
import UploadDataCsv from './uploadDataCsv'

const PillsVertical = () => {
  const [active, setActive] = useState('1')

  const toggle = tab => {
    setActive(tab)
  }
  return (
    <>
      <Card className='p-1'>
        <Row className='mt-1 '>
          <Col md='3' sm='12'>
            <Nav pills vertical className='mt-1 '>
              <NavItem>
                <NavLink
                  active={active === '1'}
                  onClick={() => {
                    toggle('1')
                  }}>
                  Upload data Via Csv
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  active={active === '2'}
                  className='mt-1'
                  onClick={() => {
                    toggle('2')
                  }}>
                  Manually Add meter
                </NavLink>
              </NavItem>
            </Nav>
          </Col>
          <Col md='9' sm='12'>
            <TabContent activeTab={active}>
              <TabPane tabId='1'>
                <UploadDataCsv />
              </TabPane>
              <TabPane tabId='2'>
                <ManuallyAddMeter setActive={setActive} />
              </TabPane>
            </TabContent>
          </Col>
        </Row>
      </Card>
    </>
  )
}
export default PillsVertical
