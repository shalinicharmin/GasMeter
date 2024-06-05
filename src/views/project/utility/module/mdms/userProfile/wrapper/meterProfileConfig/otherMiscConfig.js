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

const OtherMiscConfig = (props) => {
  const dispatch = useDispatch()
  const history = useHistory()

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const [loader, setLoader] = useState(false)
  const [dateTime, setDateTime] = useState(undefined)
  const HierarchyProgress = useSelector(
    (state) => state.UtilityMDMSHierarchyProgressReducer.responseData
  )

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

  const onDateRangeSelected = (date) => {
    setDateTime(moment(date[0]).format("YYYY-MM-DD HH:mm:ss"))
  }

  const handleButtonClick = async () => {
    setLoader(true)
    const payload = [
      {
        name: "meter",
        meter_serial: HierarchyProgress.meter_serial_number,
        command: "US_SET_RTC",
        args: {
          value: dateTime ? dateTime : "now",
          input_type: "date",
          mode: ""
        },
        value: {
          pss_id: HierarchyProgress.pss_name,
          feeder_id: HierarchyProgress.feeder_name,
          site_id: HierarchyProgress.dtr_name,
          meter_serial: HierarchyProgress.meter_serial_number,
          // protocol: 'dlms',
          // protocol_type: 'dlms'
          protocol: HierarchyProgress.meter_protocol_type,
          protocol_type: HierarchyProgress.meter_protocol_type,
          project: HierarchyProgress.project_name
        }
      }
    ]

    const [statusCode, response] = await postCommandExecutionRequest({ data: payload })
    if (statusCode === 201) {
      toast.success(<Toast msg='Command sent to meter successfully.' type='success' />, {
        hideProgressBar: true
      })
      setLoader(false)
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
    <Row>
      <Col md='5'>
        <span className='text-danger font-weight-bold'>Synchronize clock</span>
        <InputGroup className='mt_7'>
          <Flatpickr
            placeholder='Select date ...'
            onChange={onDateRangeSelected}
            className='form-control'
            options={{ enableTime: true, static: true }}
          />
          <Button color='primary' outline onClick={handleButtonClick}>
            {loader ? <Spinner size='sm' /> : "Sync"}
          </Button>
        </InputGroup>
      </Col>
    </Row>
  )
}

export default OtherMiscConfig
