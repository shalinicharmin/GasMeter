import React, { useState, useContext } from 'react'
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Row, Col, CardHeader, CardBody, ListGroup, ListGroupItem } from 'reactstrap'

import { useSkin } from '@hooks/useSkin'

// ** Context

// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'

// ** Context
import { ThemeColors } from '@src/utility/context/ThemeColors'

import GridPerformanceStackGraph from './gridPerformanceStackGraph'

import GridPerformanceTabularStats from './gridPerformanceTabularStats'

const GridPerformance = props => {
  const [active, setActive] = useState('1')

  const toggle = tab => {
    if (active !== tab) {
      setActive(tab)
    }
  }

  // ** Context, Hooks & Vars
  const { colors } = useContext(ThemeColors),
    { skin } = useSkin(),
    labelColor = skin === 'dark' ? '#b4b7bd' : '#6e6b7b',
    tooltipShadow = 'rgba(0, 0, 0, 0.25)',
    gridLineColor = 'rgba(200, 200, 200, 0.2)',
    lineChartPrimary = '#666ee8',
    lineChartDanger = '#ff4961',
    warningColorShade = '#ffbd1f'

  return (
    <>
      <React.Fragment>
        <Row>
          <Col xl='8'>
            <h4 className='mb-0 mt_15'> Grid Performance</h4>
          </Col>
          <Col xl='4'>
            <Nav className='justify-content-end' tabs>
              <NavItem>
                <NavLink
                  active={active === '1'}
                  onClick={() => {
                    toggle('1')
                  }}>
                  Stack Graph
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  active={active === '2'}
                  onClick={() => {
                    toggle('2')
                  }}>
                  Tabular Stats
                </NavLink>
              </NavItem>
            </Nav>
          </Col>
        </Row>
        <TabContent className='py-50' activeTab={active}>
          <TabPane tabId='1'>
            <div className='cardHover'>
              <GridPerformanceStackGraph
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
              <GridPerformanceTabularStats dtrSelected={props.dtrSelected} />
            </div>
          </TabPane>
        </TabContent>
      </React.Fragment>
    </>
  )
}

export default GridPerformance
