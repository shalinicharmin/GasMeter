import { useLocation } from "react-router-dom"
import UtilityProject from "@src/views/project/utility"
import ColivingProject from "@src/views/project/coliving"
import RealEstateProject from "@src/views/project/realEstate"
import OtherProject from "@src/views/project/other"
import IndustryProject from "@src/views/project/industry"
import Error from "@src/views/Error"
import ThinkGasProject from "./thinkGasDistribution"
// ** Styles
import "@styles/react/libs/tables/react-dataTable-component.scss"
import "@src/assets/css/my.scss"
import "@src/assets/css/threedotloading.scss"
import "@src/assets/js/my.js"

// Custom component
import { Row, Col, Button, Breadcrumb, BreadcrumbItem } from "reactstrap"
import { ChevronLeft } from "react-feather"
import { isAccessAllowed } from "../utils"

import { useSelector, useDispatch, batch } from "react-redux"

import { handleCurrentSelectedModuleStatus } from "@store/actions/Misc/currentSelectedModuleStatus"

import UtilityUPPCL from "./utiltyUPPCL"

const Project = () => {
  const currentSelectedModuleStatus = useSelector(
    (state) => state.CurrentSelectedModuleStatusReducer.responseData
  )

  const dispatch = useDispatch()

  const location = useLocation()
  const projectName = location.pathname.split("/")

  // console.log('Inside Porject Index .....')
  // console.log('Project Name ....')

  if (isAccessAllowed(projectName[1], projectName[2], projectName[3])) {
    if (!currentSelectedModuleStatus.project && !currentSelectedModuleStatus.prev_project) {
      // console.log('Dispatching since current and previous projects are undefined ....')

      dispatch(
        handleCurrentSelectedModuleStatus({
          project: location.pathname.split("/")[2],
          vertical: location.pathname.split("/")[1],
          module: location.pathname.split("/")[3],
          prev_project: location.pathname.split("/")[2],
          prev_vertical: location.pathname.split("/")[1],
          prev_module: location.pathname.split("/")[3]
        })
      )
    } else if (currentSelectedModuleStatus.project !== projectName[2]) {
      // console.log('Dispatching since current project doesnot match selected project ....')
      // console.log('Current Selected Module Status .....')
      // console.log(currentSelectedModuleStatus)
      // console.log(projectName[2])

      dispatch(
        handleCurrentSelectedModuleStatus({
          project: location.pathname.split("/")[2],
          vertical: location.pathname.split("/")[1],
          module: location.pathname.split("/")[3],
          prev_project: currentSelectedModuleStatus.project,
          prev_vertical: currentSelectedModuleStatus.vertical,
          prev_module: currentSelectedModuleStatus.module
        })
      )
    } else {
      // console.log('Same Project ..............')
    }
  }

  return (
    <div>
      {/* <Row>
        <Col sm='2'>
          <Button.Ripple className='btn-icon btn-sm rounded-circle' color='flat-secondary'>
            <ChevronLeft size={20} />
          </Button.Ripple>
        </Col>
        <Col className='text-right'>
          <Breadcrumb className='breadcrumb-dots'>
            <BreadcrumbItem>
              <span> Home </span>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <span> Library </span>
            </BreadcrumbItem>
            <BreadcrumbItem active>
              <span> Data </span>
            </BreadcrumbItem>
          </Breadcrumb>
        </Col>
      </Row> */}

      {projectName[1] === "utility" &&
      isAccessAllowed(projectName[1], projectName[2], projectName[3]) ? (
        projectName[2] === "uppcl" ? (
          <UtilityUPPCL module={projectName[3]} />
        ) : (
          UtilityProject(projectName[3])
        )
      ) : // {project===""?:
      // UtilityProject(projectName[3])}
      projectName[1] === "coliving" &&
        isAccessAllowed(projectName[1], projectName[2], projectName[3]) ? (
        <ColivingProject module={projectName[3]} />
      ) : projectName[1] === "realestate" &&
        isAccessAllowed(projectName[1], projectName[2], projectName[3]) ? (
        <RealEstateProject module={projectName[3]} />
      ) : projectName[1] === "other" &&
        isAccessAllowed(projectName[1], projectName[2], projectName[3]) ? (
        <OtherProject project={projectName[3]} />
      ) : projectName[1] === "industry" &&
        isAccessAllowed(projectName[1], projectName[2], projectName[3]) ? (
        <IndustryProject project={projectName[3]} />
      ) : projectName[1] === "gas-distribution" &&
        isAccessAllowed(projectName[1], projectName[2], projectName[3]) ? (
        <ThinkGasProject module={projectName[3]} />
      ) : (
        <Error />
      )}
    </div>
  )
}

export default Project
