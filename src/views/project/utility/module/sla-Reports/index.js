import React, { useState } from "react"
import { TabContent, TabPane, Nav, NavItem, NavLink } from "reactstrap"
import BlockloadSlaReport from "./blockloadSlaReport"
import DailyloadSlaReport from "./dailyloadSlaReport"
import BillingDataSLAReport from "./billingDataSLAReport"
import RCDCSLAReport from "./rcdcSLAReport"

const SLA_Reports = () => {
  const [active, setActive] = useState("1")

  const toggle = (tab) => {
    if (active !== tab) {
      setActive(tab)
    }
  }
  return (
    <React.Fragment>
      <Nav tabs>
        <NavItem>
          <NavLink
            active={active === "1"}
            onClick={() => {
              toggle("1")
            }}
          >
            BlockLoad SLA
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            active={active === "2"}
            onClick={() => {
              toggle("2")
            }}
          >
            DailyLoad SLA
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            active={active === "3"}
            onClick={() => {
              toggle("3")
            }}
          >
            Billing SLA
          </NavLink>
        </NavItem>

        <NavItem>
          <NavLink
            active={active === "4"}
            onClick={() => {
              toggle("4")
            }}
          >
            RC/DC SLA
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent className='py-50' activeTab={active}>
        <TabPane tabId='1'>
          <BlockloadSlaReport />
        </TabPane>
        <TabPane tabId='2'>
          <DailyloadSlaReport />
        </TabPane>
        <TabPane tabId='3'>
          {/* <DailyloadSlaReport /> */}
          <BillingDataSLAReport />
        </TabPane>
        <TabPane tabId='4'>
          {/* <DailyloadSlaReport /> */}
          <RCDCSLAReport />
        </TabPane>
        {/* <TabPane tabId='3'>
          <p>
            Croissant jelly tootsie roll candy canes. Donut sugar plum jujubes sweet roll chocolate
            cake wafer. Tart caramels jujubes. Dragée tart oat cake. Fruitcake cheesecake danish.
            Danish topping candy jujubes. Candy canes candy canes lemon drops caramels tiramisu
            chocolate bar pie.
          </p>
          <p>
            Gummi bears tootsie roll cake wafer. Gummies powder apple pie bear claw. Caramels bear
            claw fruitcake topping lemon drops. Carrot cake macaroon ice cream liquorice donut
            soufflé. Gummi bears carrot cake toffee bonbon gingerbread lemon drops chocolate cake.
          </p>
        </TabPane> */}
      </TabContent>
    </React.Fragment>
  )
}
export default SLA_Reports
