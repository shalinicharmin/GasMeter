import React, { useState, createContext, useEffect } from 'react'
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Badge } from 'reactstrap'
import { Box, RefreshCcw, Home, ArrowLeft } from 'react-feather'
import NonGPStore from './oldassetmeterwrapper/nongpstore'
import GpStore from './oldassetmeterwrapper/gpstore'
import Retuernstore from './oldassetmeterwrapper/retuernstore'
import Discom_gp from './oldassetmeterwrapper/discom_gp'
const RowCountContext = createContext()
const OldMeterDetail = props => {
  const [active, setActive] = useState('1')
  const [forceUpdate, setForceUpdate] = useState(true)
  const toggle = tab => {
    if (active !== tab) {
      setActive(tab)
    }
  }
  const [rowCount, setRowCount] = useState([])

  return (
    <>
      <React.Fragment>
        <Nav tabs fill>
          <NavItem>
            <NavLink
              active={active === '1'}
              onClick={() => {
                toggle('1')
                setForceUpdate(!forceUpdate)
              }}>
              <Box size={16} />
              <span className='align-middle'>
                Smart Meter
                <Badge pill color='light-primary' className='mx-1'>
                  {/* {rowCount[0]} */}
                </Badge>
              </span>
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              active={active === '2'}
              onClick={() => {
                toggle('2')
                setForceUpdate(!forceUpdate)
              }}>
              <Box size={16} />
              <span className='align-middle'>
                Non -Smart Meter{' '}
                <Badge pill color='light-primary' className='mx-1'>
                  {/* {rowCount[1]} */}
                </Badge>
              </span>
            </NavLink>
          </NavItem>

          <NavItem>
            <NavLink
              active={active === '3'}
              onClick={() => {
                toggle('3')
                setForceUpdate(!forceUpdate)
              }}>
              <RefreshCcw size={16} />
              <span className='align-middle'>
                {' '}
                Return to store
                <Badge pill color='light-primary' className='mx-1'>
                  {/* {rowCount[2]} */}
                </Badge>
              </span>
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              active={active === '4'}
              onClick={() => {
                toggle('4')
                setForceUpdate(!forceUpdate)
              }}>
              <Home size={16} />
              <span className='align-middle'>
                {' '}
                Discom/GP-HQ/FIR /MRT
                <Badge pill color='light-primary' className='mx-1'>
                  {/* {rowCount[3]} */}
                </Badge>
              </span>
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={active}>
          <RowCountContext.Provider value={{ rowCountValue: rowCount, setRowCountFn: setRowCount }}>
            <TabPane tabId='1'>
              <GpStore forceUpdate={forceUpdate} setForceUpdate={setForceUpdate} />
            </TabPane>
            <TabPane tabId='2'>
              <NonGPStore forceUpdate={forceUpdate} setForceUpdate={setForceUpdate} />
            </TabPane>
            <TabPane tabId='3'>
              <Retuernstore forceUpdate={forceUpdate} setForceUpdate={setForceUpdate} />
            </TabPane>
            <TabPane tabId='4'>
              <Discom_gp forceUpdate={forceUpdate} setForceUpdate={setForceUpdate} />
            </TabPane>
          </RowCountContext.Provider>
        </TabContent>
      </React.Fragment>
    </>
  )
}
export default OldMeterDetail

export { RowCountContext }
