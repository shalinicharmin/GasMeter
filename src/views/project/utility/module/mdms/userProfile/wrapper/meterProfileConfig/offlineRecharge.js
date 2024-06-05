import { Button, InputGroup, InputGroupAddon, Input, FormGroup, Row, Col } from "reactstrap"
import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import Toast from "@src/views/ui-elements/cards/actions/createToast"
import useJwt from "@src/auth/jwt/useJwt"

import { useDispatch, useSelector } from "react-redux"

import { handleConsumerTotalRechargesData } from "@store/actions/UtilityProject/MDMS/userprofile"

import { useLocation, useHistory } from "react-router-dom"
import authLogout from "../../../../../../../../auth/jwt/logoutlogic"

const OfflineRecharge = (props) => {
  const dispatch = useDispatch()
  const history = useHistory()

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const [rechargeValue, setRechargeValue] = useState(0)
  const [rechargeMeter, setRechargeMeter] = useState(false)

  const [TurnRelayOnCommand, setTurnRelayOnCommand] = useState(false)

  const HierarchyProgress = useSelector(
    (state) => state.UtilityMDMSHierarchyProgressReducer.responseData
  )

  const dateTimeFormat = (inputDate) => {
    return "".concat(
      inputDate.getFullYear(),
      "-",
      (inputDate.getMonth() + 1).toString().padStart(2, "0"),
      "-",
      inputDate.getDate().toString().padStart(2, "0"),
      " ",
      inputDate.getHours().toString().padStart(2, "0"),
      ":",
      inputDate.getMinutes().toString().padStart(2, "0"),
      ":",
      inputDate.getSeconds().toString().padStart(2, "0")
    )
  }

  const executeOfflineRechargeCommand = async (params) => {
    return await useJwt
      .postMdasDlmsCommandExecution(params)
      .then((res) => {
        const status = res.status
        return [status, res]
      })
      .catch((err) => {
        const status = 0
        return [status, err]
      })
  }

  const offlineMeterRecharge = async (params) => {
    return await useJwt
      .putOfflineRecharge(params)
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

  const postCommandExecutionRequest = async (jsonBody) => {
    return await useJwt
      .postMdasDlmsCommandExecution(jsonBody)
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

  const command_params_request_body = (
    command_name,
    command_value,
    command_input_type,
    command_mode
  ) => {
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
            // protocol: "DLMS",
            // protocol_type: "DLMS",
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
          command: command_name,
          args: {
            value: command_value,
            input_type: command_input_type,
            mode: command_mode
          }
        }
      ]
    }

    return commandParams
  }

  useEffect(async () => {
    if (rechargeMeter) {
      const d = new Date()
      const ms = d.getMilliseconds()

      const params = {
        project: HierarchyProgress.project_name,
        sc_no: HierarchyProgress.user_name,
        recharge_amount: rechargeValue,
        receipt_number: ms
      }

      const [statusCode, response] = await offlineMeterRecharge(params)
      const offlineRechargeResponse = response
      // console.log('Offline Recharge API Response...')
      // console.log(statusCode)
      // console.log(response.data.data.result.relay_on_flag)
      // console.log("Response ....")
      // console.log(response)
      // console.log(offlineRechargeResponse)
      // console.log("Status Code ...")
      // console.log(statusCode)

      if (statusCode === 200) {
        // 1.Store Update Wallet Balance
        const updated_wallet_balance = offlineRechargeResponse.data.data.result.wallet_balance

        // 2.Execute command on meter to recharge
        const request_body_1 = command_params_request_body(
          "US_SET_LAST_TOKEN_RECHARGE_AMOUNT",
          rechargeValue,
          "number",
          ""
        )
        // console.log("Request Body")
        // console.log(request_body_1)

        const [statusCode_1, response_1] = await executeOfflineRechargeCommand(request_body_1)

        if (statusCode_1 === 201) {
          // 3.Execute command on meter to set current timestamp
          const x = new Date()
          const current_time_stamp = dateTimeFormat(x)
          const request_body_2 = command_params_request_body(
            "US_SET_LAST_TOKEN_RECHARGE_TIME",
            current_time_stamp,
            "date",
            ""
          )
          const [statusCode_2, response_2] = await executeOfflineRechargeCommand(request_body_2)

          if (statusCode_2 === 201) {
            // 4.Execute command on meter to set aggregate value of recharge on meter
            const request_body_3 = command_params_request_body(
              "US_SET_LAST_RECHARGE_TOTAL_AMOUNT",
              updated_wallet_balance,
              "number",
              ""
            )
            const [statusCode_3, response_3] = await executeOfflineRechargeCommand(request_body_3)

            if (statusCode_3 === 201) {
              if (offlineRechargeResponse.data.data.result.relay_on_flag === 1) {
                setRechargeMeter(false)
                dispatch(handleConsumerTotalRechargesData([], true))
                setTurnRelayOnCommand(true)
                toast.success(<Toast msg='Meter successfully recharged' type='success' />, {
                  hideProgressBar: true
                })
              } else {
                setRechargeMeter(false)
                dispatch(handleConsumerTotalRechargesData([], true))
                toast.success(<Toast msg='Meter successfully recharged' type='success' />, {
                  hideProgressBar: true
                })
                props.setIsOpen(!props.isOpen)
              }
            } else if (statusCode_3 === 401 || statusCode_3 === 403) {
              setLogout(true)
            } else {
              // Something went wrong
              toast.error(<Toast msg='Something went wrong please retry' type='success' />, {
                hideProgressBar: true
              })
            }
          } else if (statusCode_2 === 401 || statusCode_2 === 403) {
            setLogout(true)
          } else {
            // Something went wrong
            toast.error(<Toast msg='Something went wrong please retry' type='success' />, {
              hideProgressBar: true
            })
          }
        } else if (statusCode_1 === 401 || statusCode_1 === 403) {
          setLogout(true)
        } else {
          // Something went wrong
          toast.error(<Toast msg='Something went wrong please retry' type='success' />, {
            hideProgressBar: true
          })
        }
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else {
        // Something went wrong please retry
        toast.error(<Toast msg='Something went wrong please retry' type='success' />, {
          hideProgressBar: true
        })
      }
    }
  }, [rechargeMeter])

  useEffect(async () => {
    if (TurnRelayOnCommand) {
      // console.log('Execute Turn Relay On Command ....')

      const payload = [
        {
          name: "meter",
          meter_serial: HierarchyProgress.meter_serial_number,
          command: "US_RELAY_ON",
          args: {
            value: "",
            input_type: "",
            mode: ""
          },
          value: {
            pss_id: HierarchyProgress.pss_name,
            feeder_id: HierarchyProgress.feeder_name,
            site_id: HierarchyProgress.dtr_name,
            meter_serial: HierarchyProgress.meter_serial_number,
            // protocol: "dlms",
            protocol: HierarchyProgress.meter_protocol_type,
            protocol_type: HierarchyProgress.meter_protocol_type,
            project: HierarchyProgress.project_name
            // protocol_type: "dlms"
          }
        }
      ]

      const [statusCode, response] = await postCommandExecutionRequest({ data: payload })
      if (statusCode === 201) {
        toast.success(<Toast msg='Command sent to meter successfully.' type='success' />, {
          hideProgressBar: true
        })
        props.setIsOpen(!props.isOpen)
      } else {
        if (typeof response === "string") {
          toast.error(<Toast msg={response} type='danger' />, { hideProgressBar: true })
        } else {
          toast.error(<Toast msg='Command sent to meter failed.' type='danger' />, {
            hideProgressBar: true
          })
        }
      }
    }
  }, [TurnRelayOnCommand])

  const isInt = (n) => {
    return n % 1 === 0
  }

  const handleButtonClick = () => {
    // console.log('Recharge Value Entered ...')
    // console.log(rechargeValue)
    // setRechargeMeter(true)
    if (isInt(rechargeValue)) {
      // if (rechargeValue <= 0 || rechargeValue > 10000) {
      //   toast.error(<Toast msg='Recharge Amount should be greater than 0 and less than 10000' type='danger' />, { hideProgressBar: true })
      // } else {
      //   setRechargeValue(parseInt(rechargeValue))
      //   setRechargeMeter(true)
      // }
      setRechargeValue(parseInt(rechargeValue))
      setRechargeMeter(true)
    } else {
      toast.error(<Toast msg='Enter Integer value .' type='danger' />, { hideProgressBar: true })
    }
  }

  return (
    <InputGroup>
      <Input
        type='number'
        placeholder='Recharge Amount(₹)'
        onChange={(e) => setRechargeValue(e.target.value)}
      />
      <InputGroupAddon addonType='append'>
        <Button color='primary' outline onClick={handleButtonClick}>
          Recharge
        </Button>
      </InputGroupAddon>
    </InputGroup>
  )
}

export default OfflineRecharge
