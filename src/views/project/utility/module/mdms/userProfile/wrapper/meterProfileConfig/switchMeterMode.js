import { ListGroup, ListGroupItem, Button, InputGroup, Input, Row, Col, Spinner } from "reactstrap"
import Flatpickr from "react-flatpickr"
import "@styles/react/libs/flatpickr/flatpickr.scss"
import { useState, useEffect } from "react"
import moment from "moment"
import { useSelector, useDispatch } from "react-redux"
import { toast } from "react-toastify"
import Toast from "@src/views/ui-elements/cards/actions/createToast"
import useJwt from "@src/auth/jwt/useJwt"

import { useLocation, useHistory } from "react-router-dom"
import authLogout from "../../../../../../../../auth/jwt/logoutlogic"

import {
  handleConsumerProfileInformationData,
  handleConsumerTotalConsumptionData,
  handleConsumerTotalRechargesData,
  handleConsumerTopAlertsData,
  handleConsumerTopMeterAlertsData,
  handleCommandInfoData
} from "@store/actions/UtilityProject/MDMS/userprofile"

import {
  handleEnergyConsumptionData,
  handleAlertsData,
  handleOpertationalStatisticsData,
  handleUptimeData,
  handleBillsGeneratedData,
  handleSLAInformationData
} from "@store/actions/UtilityProject/MDMS/user"

import { handleMDMSHierarchyProgress } from "@store/actions/UtilityProject/MDMS/HierarchyProgress"

const SwitchMeterMode = (props) => {
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
  // console.log("Hierarchy Progress ....")
  // console.log(HierarchyProgress)

  const [meterMode, setMeterMode] = useState(false)

  const clearAllEssentialData = () => {
    //Move back to DTRReset temper register
    props.updateMdmsState("user")

    //Clear All User profile Data from redux store
    dispatch(handleConsumerProfileInformationData([], true))
    dispatch(handleConsumerTotalConsumptionData([], true))
    dispatch(handleConsumerTotalRechargesData([], true))
    dispatch(handleConsumerTopAlertsData([], true))
    dispatch(handleCommandInfoData([], true))
    dispatch(handleConsumerTopMeterAlertsData([], true))

    //Clear All User Data from redux store
    dispatch(handleEnergyConsumptionData([], true))
    dispatch(handleAlertsData([], true))
    dispatch(handleUptimeData([], true))
    dispatch(handleBillsGeneratedData([], true))
    dispatch(handleOpertationalStatisticsData([], true))
    dispatch(handleSLAInformationData([], true))

    dispatch(
      handleMDMSHierarchyProgress({
        ...HierarchyProgress,
        user_name: "",
        user_type: "",
        mdms_state: "user"
      })
    )
  }

  const handleButtonClick = () => {
    setMeterMode(true)
  }

  const updateMeterMode = async (params) => {
    return await useJwt
      .setMDMSSwitchMeterMode(params)
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

  const executeMeterModeCommand = async (params) => {
    return await useJwt
      .postMdasDlmsCommandExecution(params)
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
    if (meterMode) {
      const params = {}
      if (props.consumerType === "POSTPAID") {
        params["connection_type"] = "PREPAID"
      } else {
        params["connection_type"] = "POSTPAID"
      }
      params["sc_no"] = HierarchyProgress.user_name

      const [statusCode, response] = await updateMeterMode(params)

      if (response.data.responseCode === 200) {
        // toast.success(<Toast msg='Meter mode successfully switched' type='success' />, { hideProgressBar: true })
        // clearAllEssentialData()
        // props.setIsOpen(!props.isOpen)

        let meter_mode = 0
        if (props.consumerType === "POSTPAID") {
          meter_mode = 1
        } else {
          meter_mode = 0
        }

        const commandParams = {
          data: [
            {
              name: "meter",
              meter_serial: HierarchyProgress.meter_serial_number,
              value: {
                pss_name: "",
                pss_id: HierarchyProgress.pss_name,
                feeder_id: HierarchyProgress.feeder_name,
                feeder_name: "",
                site_id: HierarchyProgress.dtr_name,
                // protocol: 'DLMS',
                // protocol_type: 'DLMS',
                protocol: HierarchyProgress.meter_protocol_type,
                protocol_type: HierarchyProgress.meter_protocol_type,
                meter_serial: HierarchyProgress.meter_serial_number,
                meter_address: "",
                sc_no: HierarchyProgress.user_name,
                project: HierarchyProgress.project_name,
                grid_id: "",
                site_name: "",
                meter_sw_version: "NA"
              },
              command: "US_SET_PAYMENT_MODE",
              args: {
                value: meter_mode,
                input_type: "number",
                mode: ""
              }
            }
          ]
        }

        const [statusCode, response] = await executeMeterModeCommand(commandParams)

        if (statusCode === 201) {
          setMeterMode(false)
          toast.success(<Toast msg='Meter mode successfully switched' type='success' />, {
            hideProgressBar: true
          })
          clearAllEssentialData()
          props.setIsOpen(!props.isOpen)
        } else if (statusCode === 401 || statusCode === 403) {
          setLogout(true)
        } else {
          toast.error(<Toast msg='Something went wrong, please retry' type='error' />, {
            hideProgressBar: true
          })
          setMeterMode(false)
        }
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else {
        toast.error(<Toast msg='Something went wrong, please retry' type='error' />, {
          hideProgressBar: true
        })
        setMeterMode(false)
      }
    }
  }, [meterMode])

  let user_type = ""
  if (props.consumerType === "POSTPAID") {
    user_type = "Switch to prepaid mode"
  } else {
    user_type = "Switch to postpaid mode"
  }

  return (
    <Row>
      <Col md='5'>
        {/* <span className='text-danger font-weight-bold'>Synchronize clock</span> */}
        <InputGroup className='mt_7'>
          <Button color='primary' outline onClick={handleButtonClick}>
            {user_type}
            {/* {loader ? <Spinner size='sm' /> : 'Sync'} */}
          </Button>
        </InputGroup>
      </Col>
    </Row>
  )
}

export default SwitchMeterMode
