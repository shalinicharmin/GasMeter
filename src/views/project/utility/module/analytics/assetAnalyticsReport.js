import React, { useState, useEffect } from 'react'
import { Col, Row, TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap'
import DtrAnalytic from './dtrListTable'
import FeederAnalytic from './feederListTable'
import PssAnalytic from './pssListTable'
import ProjectLevelReport from './projectLevelReportCards'
import { useLocation } from 'react-router-dom'

const AssetAnalyticsReport = props => {
  // console.log('Project Level Report Access .....')
  // console.log(props.projectLevelReportAccess)

  const [active, setActive] = useState('3')

  const toggle = tab => {
    if (active !== tab) {
      setActive(tab)
    }
  }

  return (
    <Row>
      {true && (
        <Col xs='12'>
          <React.Fragment>
            <Nav tabs>
              {props.pssLevelReportAccess.length > 0 && (
                <NavItem>
                  <NavLink
                    active={active === '1'}
                    onClick={() => {
                      toggle('1')
                    }}>
                    PSS
                  </NavLink>
                </NavItem>
              )}
              {props.feederLevelReportAccess.length > 0 && (
                <NavItem>
                  <NavLink
                    active={active === '2'}
                    onClick={() => {
                      toggle('2')
                    }}>
                    Feeder
                  </NavLink>
                </NavItem>
              )}
              {props.dtrLevelReportAccess.length > 0 && (
                <NavItem>
                  <NavLink
                    active={active === '3'}
                    onClick={() => {
                      toggle('3')
                    }}>
                    DTR
                  </NavLink>
                </NavItem>
              )}
            </Nav>
            <TabContent className='py-50' activeTab={active}>
              {props.pssLevelReportAccess.length > 0 && (
                <TabPane tabId='1'>
                  <PssAnalytic tableName='PSS Analytic data Table' pssLevelReportAccess={props.pssLevelReportAccess} />
                </TabPane>
              )}
              {props.feederLevelReportAccess.length > 0 && (
                <TabPane tabId='2'>
                  <FeederAnalytic tableName='Feeder Analytic data Table' feederLevelReportAccess={props.feederLevelReportAccess} />
                </TabPane>
              )}
              {props.dtrLevelReportAccess.length > 0 && (
                <TabPane tabId='3'>
                  <DtrAnalytic
                    tableName='DTR Analytic data Table'
                    openDTRReport={props.updateProjectLevel}
                    dtrLevelReportAccess={props.dtrLevelReportAccess}
                    dtr_list={props.dtr_list}
                  />
                </TabPane>
              )}
            </TabContent>
          </React.Fragment>
        </Col>
      )}

      {/* Project Level Report */}
      {props.projectLevelReportAccess && (
        <Col xs='12'>
          <ProjectLevelReport
            dtr_list={props.dtr_list}
            pss_list={props.pss_list}
            feeder_list={props.feeder_list}
            projectLevelReportAccess={props.projectLevelReportAccess}
          />
        </Col>
      )}
    </Row>
  )
}

export default AssetAnalyticsReport
