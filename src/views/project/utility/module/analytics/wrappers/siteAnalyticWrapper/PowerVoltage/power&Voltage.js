import React, { useState, useContext } from 'react'
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Row, Col, CardHeader, CardBody, ListGroup, ListGroupItem } from 'reactstrap'
import LineChart from '../lineChart'
import PeakPowerStackGraph from './peakPowerStackGraph'
import AvgPowerStackGraph from './avgPowerStackGraph'
import AvgVoltageStackGraph from './avgVoltageStackGraph'

import { useSkin } from '@hooks/useSkin'
// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'

// ** Context
import { ThemeColors } from '@src/utility/context/ThemeColors'
const PowerVoltage = props => {
  const [active, setActive] = useState('1')

  const toggle = tab => {
    if (active !== tab) {
      setActive(tab)
    }
  }
  const { colors } = useContext(ThemeColors),
    { skin } = useSkin(),
    labelColor = skin === 'dark' ? '#b4b7bd' : '#6e6b7b',
    tooltipShadow = 'rgba(0, 0, 0, 0.25)',
    gridLineColor = 'rgba(200, 200, 200, 0.2)',
    lineChartPrimary = '#666ee8',
    lineChartDanger = '#ff4961',
    warningColorShade = '#ffbd1f',
    lineChartRed = '#ff4961',
    lineChartYellow = '#ffff33',
    lineChartBlue = '#666ee8'

  return (
    <React.Fragment>
      <Row>
        <Col xl='6'>
          <h4 className='mb-0 mt_15'>Power & Voltage Report</h4>
        </Col>
        <Col xl='6'>
          <Nav className='justify-content-end' tabs>
            <NavItem>
              <NavLink
                active={active === '1'}
                onClick={() => {
                  toggle('1')
                }}>
                Peak Power
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={active === '2'}
                onClick={() => {
                  toggle('2')
                }}>
                Average Power
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={active === '3'}
                onClick={() => {
                  toggle('3')
                }}>
                Average Voltage
              </NavLink>
            </NavItem>
          </Nav>
        </Col>
      </Row>
      <TabContent className='py-50' activeTab={active}>
        <TabPane tabId='1'>
          <div className='cardHover'>
            <PeakPowerStackGraph
              warningColorShade={warningColorShade}
              lineChartDanger={lineChartDanger}
              lineChartPrimary={lineChartPrimary}
              labelColor={labelColor}
              tooltipShadow={tooltipShadow}
              gridLineColor={gridLineColor}
              dtrSelected={props.dtrSelected}
            />
          </div>
        </TabPane>

        <TabPane tabId='2'>
          <div className='cardHover'>
            <AvgPowerStackGraph
              warningColorShade={warningColorShade}
              lineChartDanger={lineChartDanger}
              lineChartPrimary={lineChartPrimary}
              labelColor={labelColor}
              tooltipShadow={tooltipShadow}
              gridLineColor={gridLineColor}
              dtrSelected={props.dtrSelected}
            />
          </div>
        </TabPane>

        <TabPane tabId='3'>
          <div className='cardHover'>
            <AvgVoltageStackGraph
              warningColorShade={warningColorShade}
              lineChartDanger={lineChartDanger}
              lineChartPrimary={lineChartPrimary}
              labelColor={labelColor}
              tooltipShadow={tooltipShadow}
              gridLineColor={gridLineColor}
              lineChartRed={lineChartRed}
              lineChartYellow={lineChartYellow}
              lineChartBlue={lineChartBlue}
              dtrSelected={props.dtrSelected}
            />
          </div>
        </TabPane>
      </TabContent>
    </React.Fragment>
  )
}

export default PowerVoltage
