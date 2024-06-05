import { useState, useEffect } from "react"
import useJwt from "@src/auth/jwt/useJwt"
import { Row, Col, Spinner } from "reactstrap"
import { ChevronLeft, Settings } from "react-feather"
import Loader from "@src/views/project/misc/loader"

//Wrapper Functions
import AlertCard from "@src/views/ui-elements/cards/gpCards/alertCardUpdated"
import PeriodicWrapper from "@src/views/project/utility/module/mdms/userProfile/wrapper/periodicData"
import BlockLoad from "@src/views/project/utility/module/mdms/userProfile/wrapper/blockLoad"
import DailyLoad from "@src/views/project/utility/module/mdms/userProfile/wrapper/dailyLoad"
import MonthlyBillDetermine from "@src/views/project/utility/module/mdms/userProfile/wrapper/monthlyBillDetermine"
import UserDetailWrapper from "./wrapper/userDetailWrapper"
import TotalConsumptionWrapper from "./wrapper/totalConsumptionWrapper"
import TotalRechargesWrapper from "./wrapper/totalRechargesWrapper"
import CommandInfoTableWrapper from "./wrapper/commandInfoTableWrapper"
import PrepaidLedgerWrapper from "./wrapper/prepaidLedgerWrapper"
import GeneratedBillsWrapper from "./wrapper/generatedBillsWrapper"
import MeterProfileConfig from "@src/views/project/utility/module/mdms/userProfile/wrapper/meterProfileConfig"

import { useDispatch, useSelector } from "react-redux"
import { useLocation, useHistory } from "react-router-dom"
import authLogout from "../../../../../../auth/jwt/logoutlogic"

import { handleMDMSHierarchyProgress } from "@store/actions/UtilityProject/MDMS/HierarchyProgress"

import {
  handleConsumerProfileInformationData,
  handleConsumerTotalConsumptionData,
  handleConsumerTotalRechargesData,
  handleConsumerTopAlertsData,
  handleConsumerTopMeterAlertsData,
  handleCommandInfoData
} from "@store/actions/UtilityProject/MDMS/userprofile"

const MdmsUserConsumptionModule = (props) => {
  const dispatch = useDispatch()
  const history = useHistory()

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const HierarchyProgress = useSelector(
    (state) => state.UtilityMDMSHierarchyProgressReducer.responseData
  )

  // console.log('User Hierarchy Progress ....')
  // console.log(HierarchyProgress)

  const [isOpen, setIsOpen] = useState(false)

  const [meterConnectionStatus, setMeterConnectionStatus] = useState(undefined)

  const fetchData = async (params) => {
    return await useJwt
      .getMDMSUserMeterConnectionStatus(params)
      .then((res) => {
        const status = res.status
        return [status, res]
      })
      .catch((err) => {
        if (err.response) {
          const status = err.response.status
          return [status, err]
        } else {
          return [0, err]
        }
      })
  }

  useEffect(async () => {
    const params = {
      project: HierarchyProgress.project_name,
      sc_no: HierarchyProgress.user_name,
      meter_address: HierarchyProgress.meter_address,
      grid_id: HierarchyProgress.grid_id
    }

    const [statusCode, response] = await fetchData(params)

    if (statusCode === 200) {
      setMeterConnectionStatus(response.data.data.result.stat.meterConnectionStatus)
    } else if (statusCode === 401 || statusCode === 403) {
      setLogout(true)
    }
  }, [HierarchyProgress])

  const onBackButtonClickHandler = () => {
    //Move back to DTRReset temper register
    props.updateMdmsState("user")

    //Clear All User profile Data from redux store
    dispatch(handleConsumerProfileInformationData([], true))
    dispatch(handleConsumerTotalConsumptionData([], true))
    dispatch(handleConsumerTotalRechargesData([], true))
    dispatch(handleConsumerTopAlertsData([], true))
    dispatch(handleCommandInfoData([], true))
    dispatch(handleConsumerTopMeterAlertsData([], true))

    dispatch(
      handleMDMSHierarchyProgress({
        ...HierarchyProgress,
        user_name: "",
        user_type: "",
        mdms_state: "user"
      })
    )
  }

  if (HierarchyProgress.user_type === "POSTPAID") {
    return (
      <div id='dashboard-ecommerce'>
        <Row className='mb-1'>
          <Col>
            {props.showBackButton && (
              <span onClick={onBackButtonClickHandler} className='cursor-pointer'>
                <ChevronLeft className='mb_3 anim_left' /> Back to User List
              </span>
            )}
          </Col>
          <Col className='text-center'>
            <span>
              <span style={{ position: "relative", fontSize: "16px", top: "-3px" }}>
                Meter status :{" "}
                {meterConnectionStatus ? (
                  meterConnectionStatus === "Connected" ? (
                    <strong>connected</strong>
                  ) : (
                    <strong>Disconnected</strong>
                  )
                ) : (
                  ""
                )}
              </span>{" "}
              {meterConnectionStatus ? (
                meterConnectionStatus === "Connected" ? (
                  <div className='con_stat bg-success mt_5'></div>
                ) : (
                  <div className='con_stat bg-danger mt_5'></div>
                )
              ) : (
                <Spinner size='sm' className='mb_4' />
              )}
            </span>
          </Col>
          <Col>
            <span className='float-right mx-1 cursor-pointer' onClick={() => setIsOpen(true)}>
              <Settings />
            </span>
          </Col>
        </Row>

        {/* New UI */}
        <Row className='match-height'>
          <Col lg='7'>
            <Row className='match-height'>
              <Col md='6'>
                <UserDetailWrapper hierarchy={"userProfile"} height='height-248' />
              </Col>
              <Col md='6'>
                {/* <TotalConsumptionWrapper hierarchy={"userProfile"} dvClas='py_10' /> */}
                <GeneratedBillsWrapper dvClas='py_10' />
              </Col>
              {/* <Col lg='6' xs='6'>
                <PeriodicWrapper />
              </Col> */}
              <Col lg='6' xs='6'>
                <BlockLoad />
              </Col>
              <Col lg='6' xs='6'>
                <DailyLoad />
              </Col>
              <Col lg='12' md='12' xs='12'>
                <MonthlyBillDetermine />
              </Col>
            </Row>
          </Col>
          {/* <Col lg='4' md='6' className='px-0'>
            <Row>
              <UserDetailWrapper hierarchy={'userProfile'} />
            </Row>
          </Col>
          <Col lg='3' md='6' className='px-0'>
            <Row className='match-height px-1'>
              <TotalConsumptionWrapper hierarchy={'userProfile'} dvClas='py_10' />
              <GeneratedBillsWrapper dvClas='py_10' />
            </Row>
          </Col> */}
          <Col lg='5'>
            {/* Change Hierarchy value to userProfile when API for user level alerts is created */}
            <AlertCard height='height-290' loaderHeight='height-550' hierarchy={"userProfile"} />
          </Col>
        </Row>

        {/* <Row>
          <PeriodicWrapper />
          <BlockLoad />
          <DailyLoad />
          <MonthlyBillDetermine />
        </Row> */}
        <Row>
          <Col>
            <CommandInfoTableWrapper
              HierarchyProgress={props.HierarchyProgress}
              tableName={"Command info"}
              hierarchy={"user"}
              txtLen={20}
              length={"12"}
            />
          </Col>
        </Row>

        {isOpen && (
          <MeterProfileConfig
            updateMdmsState={props.updateMdmsState}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            consumerType={HierarchyProgress.user_type}
            title='Profile setting'
          />
        )}
      </div>
    )
  } else {
    return (
      <div id='dashboard-ecommerce'>
        <Row className='mb-1'>
          <Col>
            {props.showBackButton && (
              <span onClick={onBackButtonClickHandler} className='cursor-pointer'>
                <ChevronLeft className='mb_3 anim_left' /> Back to User
              </span>
            )}
          </Col>
          <Col className='text-center'>
            <span>
              <span style={{ position: "relative", fontSize: "16px", top: "-3px" }}>
                Meter status :{" "}
                {meterConnectionStatus ? (
                  meterConnectionStatus === "Connected" ? (
                    <strong>connected</strong>
                  ) : (
                    <strong>Disconnected</strong>
                  )
                ) : (
                  ""
                )}
              </span>{" "}
              {meterConnectionStatus ? (
                meterConnectionStatus === "Connected" ? (
                  <div className='con_stat bg-success mt_5'></div>
                ) : (
                  <div className='con_stat bg-danger mt_5'></div>
                )
              ) : (
                <Spinner size='sm' className='mb_4' />
              )}
            </span>
          </Col>
          <Col>
            <span className='float-right mx-1 cursor-pointer' onClick={() => setIsOpen(true)}>
              <Settings />
            </span>
          </Col>
        </Row>

        {/* New UI */}
        <Row className='match-height'>
          <Col lg='7' className='px-0'>
            {/* <Row className='match-height px-1'>
              <Col>
                <UserDetailWrapper hierarchy={'userProfile'} height='height-280' />
              </Col>
              <Col className='px-0'>
                <TotalConsumptionWrapper hierarchy={'userProfile'} />
                <TotalRechargesWrapper hierarchy={'userProfile'} />
              </Col>
            </Row>
            <Col>
              <PrepaidLedgerWrapper project={HierarchyProgress.project_name} />
            </Col> */}
            <Row className='match-height px-1'>
              <Col>
                <UserDetailWrapper hierarchy={"userProfile"} height='height-280' />
              </Col>
              <Col>
                {/* <TotalConsumptionWrapper hierarchy={"userProfile"} /> */}
                <TotalRechargesWrapper hierarchy={"userProfile"} />
              </Col>
            </Row>
            <Row className='px-1'>
              <Col>
                <PrepaidLedgerWrapper project={HierarchyProgress.project_name} />
              </Col>
              <Col>
                <GeneratedBillsWrapper />
              </Col>
            </Row>
          </Col>
          <Col lg='5'>
            {/* Change Hierarchy value to userProfile when API for user level alerts is created */}
            <AlertCard height='height-250' loaderHeight='height-400' hierarchy={"userProfile"} />
          </Col>
        </Row>

        <Row>
          <Col md='3' className='pr-0'>
            <PeriodicWrapper />
          </Col>
          <Col md='3' className='pr-0'>
            <BlockLoad />
          </Col>
          <Col md='3'>
            <DailyLoad />
          </Col>
          <Col md='3' className='pl-0'>
            <MonthlyBillDetermine />
          </Col>
        </Row>
        <CommandInfoTableWrapper
          HierarchyProgress={props.HierarchyProgress}
          tableName={"Command info"}
          hierarchy={"user"}
          txtLen={12}
          length={"12"}
        />

        {isOpen && (
          <MeterProfileConfig
            updateMdmsState={props.updateMdmsState}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title='Profile setting'
          />
        )}
      </div>
    )
  }
}

export default MdmsUserConsumptionModule
