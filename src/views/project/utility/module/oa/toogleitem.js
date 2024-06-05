import React, { useState } from 'react'
import { TabContent, TabPane, Nav, NavItem, NavLink, Row, Col } from 'reactstrap'
import { Home, FileText, Clock, ArrowLeft } from 'react-feather'
import OldAsset from './oldAsset'
import Assetlifecycle from './assetlifecycle'

const Toogleitem = props => {
  const [active, setActive] = useState('1')

  const toggle = tab => {
    setActive(tab)
  }
  return (
    <>
      {/* BACK TO VMS */}
      <h5 className='cursor-pointer' onClick={() => props.back(false)}>
        <ArrowLeft size={21} className='anim_left' /> Back to VMS
      </h5>
      <Nav className='justify-content-center' tabs>
        <NavItem>
          <NavLink
            active={active === '1'}
            onClick={() => {
              toggle('1')
            }}>
            <Home size={14} />
            <span className='align-middle'> Old Asset Meter</span>
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            active={active === '2'}
            onClick={() => {
              toggle('2')
            }}>
            <Clock size={14} />
            <span className='align-middle'> Asset Life Cycle</span>
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent className='py-50' activeTab={active}>
        <TabPane tabId='1'>
          <OldAsset setActive={setActive} back={props.back} />
        </TabPane>
        <TabPane tabId='2'>
          <Assetlifecycle />
        </TabPane>
      </TabContent>
    </>
  )
}
export default Toogleitem
