// import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable'
// import { useState } from 'react'
import { Row, Col } from "reactstrap"

// import AlertCard from '@src/views/ui-elements/cards/gpCards/alertCardUpdated'
import UptimeWrapper from "@src/views/project/utility/module/mdms/wrapper/UptimeInformationHorizontalWrapper"
// import BillsGeneratedWrapper from '@src/views/project/utility/module/mdms/wrapper/BillsGeneratedInformationHorizontalWrapper'
import OperationalInformationWrapper from "@src/views/project/utility/module/mdms/wrapper/OperationalInformationWrapper"
import EnergyConsumptionWrapper from "@src/views/project/utility/module/mdms/wrapper/EnergyConsumptionInformationWrapper"

import SLAInformationWrapper from "@src/views/project/utility/module/mdms/wrapper/SLAInformationWrapper"

import { useSelector, useDispatch } from "react-redux"

import { handleMDMSHierarchyProgress } from "@store/actions/UtilityProject/MDMS/HierarchyProgress"

import { ChevronLeft } from "react-feather"

import {
  handleEnergyConsumptionData,
  handleAlertsData,
  handleOpertationalStatisticsData,
  handleUptimeData,
  handleBillsGeneratedData,
  handleSLAInformationData
} from "@store/actions/UtilityProject/MDMS/user"
import NameplateWrapper from "./wrapper/nameplateData"
import InstantenousWrapper from "./wrapper/instantenousLoadData"
import PeriodicPushWrapper from "./wrapper/periodicPushData"
import DailyLoadWrapper from "./wrapper/dailyLoadData"
import BlockLoadWrapper from "./wrapper/blockLoadData"
import BillingHistoryWrapper from "./wrapper/billingHistoryData"

const AllUsers = (props) => {
  const dispatch = useDispatch()
  const responseData = useSelector(
    (state) => state.UtilityMDMSHierarchyProgressReducer.responseData
  )

  // console.log("Redux Store Data ....")
  // console.log(responseData)

  let dtr_name = ""
  // if (responseData && responseData.dtr_real_name) {
  //   dtr_name = responseData.dtr_real_name
  // }

  if (responseData && responseData.dtr_real_name) {
    dtr_name = responseData.dtr_real_name
  }

  // console.log("Hierarchy Progress ....")
  // console.log(responseData)

  const onUserTableRowClickHandler = (user, row) => {
    //Move to user profile
    props.updateMdmsState("user_profile")
    props.updateConnectionType(row.connection_type)

    // console.log('User Row Selected ....')
    // console.log(row)

    //Update Hierarchy Progress
    dispatch(
      handleMDMSHierarchyProgress({
        ...responseData,
        user_name: user,
        user_type: row.connection_type,
        meter_serial_number: row.meter_number,
        // mdms_state: 'userConsumption',
        mdms_state: "user_profile",
        meter_address: row.meter_address,
        grid_id: row.grid_id,
        meter_protocol_type: row.meter_protocol_type.toLowerCase()
      })
    )
  }

  const onBackButtonClickHandler = () => {
    props.updateMdmsState("dtr")

    //Clear All User Data from redux store
    dispatch(handleEnergyConsumptionData([], true))
    dispatch(handleAlertsData([], true))
    dispatch(handleUptimeData([], true))
    dispatch(handleBillsGeneratedData([], true))
    dispatch(handleOpertationalStatisticsData([], true))
    dispatch(handleSLAInformationData([], true))

    //Update Hierarchy Progress
    dispatch(
      handleMDMSHierarchyProgress({
        ...responseData,
        user_name: "",
        user_type: "",
        meter_serial_number: "",
        meter_address: "",
        grid_id: "",
        mdms_state: "dtr",
        meter_protocol_type: ""
      })
    )
  }

  return (
    <div className='h-100 w-100'>
      {props.showBackButton && (
        <span onClick={onBackButtonClickHandler} className='cursor-pointer'>
          <ChevronLeft className='mb_3 anim_left' /> Back to DTR List
        </span>
      )}
      <Row className='match-height'>
        <Col md='12'>
          <EnergyConsumptionWrapper
            statehandler={onUserTableRowClickHandler}
            txtLen={12}
            tableName={`User Level (${dtr_name})`}
            height={true}
            hierarchy={"user"}
          />
        </Col>

        <Col xs='12'>
          <Row className='match-height'>
            {/* <Col lg='6' xs='12' className='pl-0'>
              <NameplateWrapper />
            </Col>
            <Col lg='6' xs='12' className='pl-0'>
              <InstantenousWrapper />
            </Col> */}
            {/* <Col lg='3' xs='6' className='pl-0'>
              <PeriodicPushWrapper />
            </Col> */}
            <Col lg='4' xs='6' className='pl-0'>
              <DailyLoadWrapper />
            </Col>
            <Col lg='4' xs='6' className='pl-0'>
              <BlockLoadWrapper />
            </Col>
            <Col lg='4' xs='6' className='pl-0'>
              <BillingHistoryWrapper />
            </Col>

            {/* <UptimeWrapper hierarchy={'user'} multi={true} /> */}
            {/* <BillsGeneratedWrapper hierarchy={'user'} /> */}
            <OperationalInformationWrapper
              height='height-367'
              hierarchy={"user"}
              // cols={{ xs: "3" }}
            />
            {/* <SLAInformationWrapper height='height-367' hierarchy={'user'} cols={{ xs: '3' }} /> */}
          </Row>
        </Col>
        {/* <Col md='6' xs='12' className='p-0'>
          <AlertCard height='height-345' loaderHeight='height-495' hierarchy='user' />
        </Col> */}
      </Row>
    </div>
  )
}

export default AllUsers
