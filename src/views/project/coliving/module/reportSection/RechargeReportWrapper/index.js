import { Fragment, useState } from 'react'
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, CardBody } from 'reactstrap'
import RechargeReportHistory from './rechargeReportHistory'
import RechargeReport from './rechargeReport'

const RechargeReportNav = props => {
  const [active, setActive] = useState('1')

  const toggle = tab => {
    setActive(tab)
  }
  return (
    <Fragment>
      <Card>
        <CardBody className='p-1'>
          <Nav pills className='justify-content-start '>
            <NavItem>
              <NavLink
                active={active === '1'}
                onClick={() => {
                  toggle('1')
                }}>
                Recharge Report
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={active === '2'}
                onClick={() => {
                  toggle('2')
                }}>
                Recharge Report History
              </NavLink>
            </NavItem>
          </Nav>

          <TabContent className='py-50' activeTab={active}>
            <TabPane tabId='1'>
              <RechargeReport dtr_list={props.dtr_list} pss_list={props.pss_list} feeder_list={props.feeder_list} />
            </TabPane>
            <TabPane tabId='2'>
              <RechargeReportHistory dtr_list={props.dtr_list} pss_list={props.pss_list} feeder_list={props.feeder_list} />
            </TabPane>
          </TabContent>
        </CardBody>
      </Card>
    </Fragment>
  )
}
export default RechargeReportNav
