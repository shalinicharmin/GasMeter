import React, { useState } from "react"
import { Card, CardBody, CardHeader, Col, Row, UncontrolledTooltip, Button } from "reactstrap"
import { ChevronDown, Command, X } from "react-feather"
import CardInfo from "@src/views/ui-elements/cards/actions/cardInfo"
import CommandExecuTabs from "./commandExecuTabs"
import { useSelector } from "react-redux"

const CommandExecutionDropdown = (props) => {
  const [dropDownStyle, setDropDownStyle] = useState("translateY(-100%)")
  const [tabActive, setTabActive] = useState("1")
  const [icoToggle, setIcoToggle] = useState(true)
  const [selected_project, set_selected_project] = useState(undefined)
  const [fetchingData, setFetchingData] = useState(true)

  const toggleCommandExecutionModal = (val) => {
    setIcoToggle(!icoToggle)
    dropDownStyle === "translateY(0)"
      ? setDropDownStyle("translateY(-100%)")
      : setDropDownStyle("translateY(0)")
    if (icoToggle) {
      document.getElementById("notch").firstChild.innerHTML =
        '<polyline points="18 15 12 9 6 15"></polyline>'
    } else {
      document.getElementById("notch").firstChild.innerHTML =
        '<polyline points="6 9 12 15 18 9"></polyline>'
    }
  }

  const currentSelectedModuleStatus = useSelector(
    (state) => state.CurrentSelectedModuleStatusReducer.responseData
  )

  if (currentSelectedModuleStatus.prev_project) {
    if (
      selected_project !== currentSelectedModuleStatus.project &&
      currentSelectedModuleStatus.prev_project !== currentSelectedModuleStatus.project
    ) {
      set_selected_project(currentSelectedModuleStatus.project)
      setFetchingData(true)
    }
  }

  return (
    <>
      <Col className='meter_command_floating p-0' style={{ transform: dropDownStyle }}>
        <Card className='mb-0'>
          <CardHeader className='p-1'>
            <Row className='w-100'>
              <Col lg='11' md='10' xs='9'>
                <h3 className='mt_12'>Command Execution</h3>
              </Col>
              <Col lg='1' md='2' xs='3'>
                <Button.Ripple
                  className='btn-icon px_1 py_1 mt_12 mx-1'
                  id='positionTop'
                  outline
                  color='danger'
                  onClick={(e) => toggleCommandExecutionModal(e)}
                >
                  <X size={16} />
                </Button.Ripple>
                <UncontrolledTooltip placement='top' target='positionTop'>
                  Close
                </UncontrolledTooltip>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            <CommandExecuTabs
              reloadCommandHistory={props.reloadCommandHistory}
              setFetchingData={setFetchingData}
              fetchingData={fetchingData}
              toggleCommandExecutionModal={toggleCommandExecutionModal}
            />
          </CardBody>
        </Card>
        <div className='notch' id='notch' onClick={(e) => toggleCommandExecutionModal(e)}>
          <ChevronDown className='ChevronDown_ico' size={20} />
        </div>
      </Col>
    </>
  )
}

export default CommandExecutionDropdown
