import { Button, Col, Row } from "reactstrap"
import Select from "react-select"
import { useEffect, useState } from "react"
import useJwt from "@src/auth/jwt/useJwt"
import { selectThemeColors } from "@utils"
import { useSelector, useDispatch } from "react-redux"
import { toast } from "react-toastify"
import Toast from "@src/views/ui-elements/cards/actions/createToast"
import CommandHistory from "@src/views/project/utility/module/hes/wrappers/commandHistory"
import FirmwareUploadIFrame from "./firmwareUploadIFrame"

import { useLocation, useHistory } from "react-router-dom"
import authLogout from "../../../../../../../../auth/jwt/logoutlogic"

const UpdateFirmware = (props) => {
  const dispatch = useDispatch()
  const history = useHistory()

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const globalData = useSelector((state) => state.UtilityMDMSHierarchyProgressReducer.responseData)
  let user_name = ""
  if (globalData && globalData.user_name) {
    user_name = globalData.user_name
  }

  const [resp, setResp] = useState()
  const [selectCommand, setSelectCommand] = useState("")

  const [reloadCommandHistory, setReloadCommandHistory] = useState(false)
  const [protocol, setProtocol] = useState("dlms")

  const [isOpen, setIsOpen] = useState(false)

  const refreshCommandHistory = () => {
    // console.log('hello')
    // setReloadCommandHistory(false)
    setReloadCommandHistory(true)
  }

  const doNotRefreshCommandHistory = () => {
    setReloadCommandHistory(false)
  }

  const protocolSelectedForCommandExecution = (val) => {
    setProtocol(val)
  }

  const getFWOptions = async (params) => {
    return await useJwt
      .getMdasDlmsCommandsList(params)
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

  useEffect(async () => {
    const [statusCode, response] = await getFWOptions({ command: "FW_UPGRADE" })
    if (response.data.data.result && response.data.data.result.length > 0) {
      setResp(response.data.data.result[0]["options"][0]["params"])
    }
  }, [])

  const handleClickBtn = async () => {
    if (!selectCommand) {
      toast.error(<Toast msg='Please select the command.' type='danger' />, {
        hideProgressBar: true
      })
      return false
    }

    const params = [
      {
        name: "meter",
        meter_serial: globalData.meter_serial_number,
        value: {
          pss_id: globalData.pss_name,
          feeder_id: globalData.feeder_name,
          site_id: globalData.dtr_name,
          meter_serial: globalData.meter_serial_number,
          // protocol: "dlms",
          protocol: globalData.meter_protocol_type,
          project: globalData.project_name,
          protocol_type: "dlms"
          // protocol_type: globalData.meter_protocol_type
        },
        command: "FW_UPGRADE",
        args: {
          value: selectCommand.value,
          input_type: "text",
          mode: ""
        }
      }
    ]

    const [status, resp] = await postCommandExecutionRequest({ data: params })
    if (status === 201) {
      setSelectCommand("")
      toast.success(<Toast msg='Command sent to meter successfully.' type='success' />, {
        hideProgressBar: true
      })
    } else if (statusCode === 401 || statusCode === 403) {
      setLogout(true)
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

  return (
    <div>
      <Row>
        <Col xs='6'>
          {resp && (
            <Select
              isClearable={true}
              closeMenuOnSelect={true}
              isSearchable={true}
              theme={selectThemeColors}
              isMulti={resp.isMulti}
              options={resp.options}
              onChange={setSelectCommand}
              className='react-select border-secondary rounded zindex_1000'
              classNamePrefix='select'
              placeholder={resp.placeholder}
            />
          )}
        </Col>
        <Col xs='2'>
          <Button color='primary' outline onClick={handleClickBtn}>
            Update
          </Button>
        </Col>
        <Col xs='4'>
          <Button color='secondary' outline onClick={() => setIsOpen(true)}>
            Upload Firmware
          </Button>
        </Col>
        <Col>
          <CommandHistory
            protocol={protocol}
            protocolSelectionOption={false}
            reloadCommandHistory1={reloadCommandHistory}
            txtLen={12}
            protocolSelectedForCommandExecution={protocolSelectedForCommandExecution}
            refreshCommandHistory={refreshCommandHistory}
            doNotRefreshCommandHistory={doNotRefreshCommandHistory}
            tableName={"Firmware Update History".concat("(", user_name, ")")}
            params={{
              page: 1,
              page_size: 10,
              project: globalData.project_name,
              meter: globalData.meter_serial_number,
              asset_type: "meter",
              command: "FW_UPGRADE"
            }}
          />
        </Col>
      </Row>
      {isOpen && (
        <FirmwareUploadIFrame isOpen={isOpen} setIsOpen={setIsOpen} title='Firmware Upload' />
      )}
    </div>
  )
}

export default UpdateFirmware
