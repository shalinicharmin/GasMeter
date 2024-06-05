import React, { useState } from "react"
import { TabContent, TabPane, Nav, NavItem, NavLink } from "reactstrap"
import CommandHistory from "./CommandHistoryWrapper/commandHistory"
import PushData from "./PushDataWrapper/pushData"
import MeterProfile from "./MeterProfilewrapper/meterProfile"

const ThinkgasTabs = () => {
  const [active, setActive] = useState("1")

  const toggle = (tab) => {
    if (active !== tab) {
      setActive(tab)
    }
  }
  return (
    <React.Fragment>
      <Nav tabs fill>
        <NavItem>
          <NavLink
            active={active === "1"}
            onClick={() => {
              toggle("1")
            }}
          >
            Command History
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            active={active === "2"}
            onClick={() => {
              toggle("2")
            }}
          >
            Push Data
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            active={active === "3"}
            onClick={() => {
              toggle("3")
            }}
          >
            Meter Profile
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent className='py-50' activeTab={active}>
        <TabPane tabId='1'>{active === "1" && <CommandHistory />}</TabPane>
        <TabPane tabId='2'>{active === "2" && <PushData />}</TabPane>
        <TabPane tabId='3'>{active === "3" && <MeterProfile />}</TabPane>
      </TabContent>
    </React.Fragment>
  )
}
export default ThinkgasTabs
