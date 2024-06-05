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
  DropdownMenu,
  Card,
  CardBody
} from "reactstrap"
import Blockload from "./blockloadSla"

const SlaTab = () => {
  const [active, setActive] = useState("1")
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen)

  const toggle = (tab) => {
    setActive(tab)
  }
  return (
    <React.Fragment>
      <Card className='p-2'>
        <Nav pills>
          <NavItem>
            <NavLink
              active={active === "1"}
              onClick={() => {
                toggle("1")
              }}
            >
              Block load
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              active={active === "2"}
              onClick={() => {
                toggle("2")
              }}
            >
              Periodic
            </NavLink>
          </NavItem>
        </Nav>

        <CardBody className='p-0'>
          <TabContent className='py-50' activeTab={active}>
            <TabPane tabId='1'>
              {/* <BlockLoadSla /> */}
              <Blockload />
            </TabPane>
            <TabPane tabId='2'>
              <p>
                Pudding candy canes sugar plum cookie chocolate cake powder croissant. Carrot cake
                tiramisu danish candy cake muffin croissant tart dessert. Tiramisu caramels candy
                canes chocolate cake sweet roll liquorice icing cupcake.Bear claw chocolate
                chocolate cake jelly-o pudding lemon drops sweet roll sweet candy. Chocolate sweet
                chocolate bar candy chocolate bar chupa chups gummi bears lemon drops.
              </p>
            </TabPane>
          </TabContent>
        </CardBody>
      </Card>
    </React.Fragment>
  )
}
export default SlaTab
