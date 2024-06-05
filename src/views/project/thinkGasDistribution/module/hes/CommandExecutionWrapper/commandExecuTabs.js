import React, { useState } from "react"
import classnames from "classnames"
import {
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  DropdownMenu
} from "reactstrap"
import MeterwiseCommandExecutionTabs from "./MeterwiseCommandExcu/meterwisecommandexutabs"
import CitywiseCommand from "./CitywiseCommandExecu/citywiseCommand"
import ZonewiseCommand from "./ZoneWiseCommnadExecu/zonewiseCommand"
import AreawiseCommandExecu from "./AreawiseCommandExecu/areawiseCommandExecu"

const CommandExecuTabs = (props) => {
  const [active, setActive] = useState("1")
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen)

  const toggle = (tab) => {
    setActive(tab)
  }
  return (
    <React.Fragment>
      <Nav pills className='mb-0 pb-0'>
        <NavItem>
          <NavLink
            active={active === "1"}
            onClick={() => {
              toggle("1")
            }}
          >
            City
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            active={active === "2"}
            onClick={() => {
              toggle("2")
            }}
          >
            Zone
          </NavLink>
        </NavItem>

        <NavItem>
          <NavLink
            active={active === "3"}
            onClick={() => {
              toggle("3")
            }}
          >
            Area
          </NavLink>
        </NavItem>

        <NavItem>
          <NavLink
            active={active === "4"}
            onClick={() => {
              toggle("4")
            }}
          >
            Meter
          </NavLink>
        </NavItem>
      </Nav>

      <TabContent className='py-50' activeTab={active}>
        <TabPane tabId='1'>
          <CitywiseCommand />
        </TabPane>
        <TabPane tabId='2'>
          <ZonewiseCommand />
        </TabPane>
        <TabPane tabId='3'>
          <AreawiseCommandExecu />
        </TabPane>
        <TabPane tabId='4'>
          <MeterwiseCommandExecutionTabs
            reloadCommandHistory={props.reloadCommandHistory}
            toggleCommandExecutionModal={props.toggleCommandExecutionModal}
            setFetchingData={props.setFetchingData}
            fetchingData={props.fetchingData}
          />
        </TabPane>
      </TabContent>
    </React.Fragment>
  )
}
export default CommandExecuTabs
