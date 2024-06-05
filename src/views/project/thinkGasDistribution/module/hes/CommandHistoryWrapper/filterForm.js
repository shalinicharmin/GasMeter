import React, { useState, useEffect } from "react"
import { Button, Col, Row, Form, FormGroup, Label, Input, CustomInput } from "reactstrap"
import Select from "react-select"
import { toast } from "react-toastify"
import Toast from "@src/views/ui-elements/cards/actions/createToast"
import useJwt from "@src/auth/jwt/useJwt"
import authLogout from "../../../../../../auth/jwt/logoutlogic"
import { useDispatch } from "react-redux"
import { useHistory, useLocation } from "react-router-dom"
import { selectThemeColors } from "@utils"
import Flatpickr from "react-flatpickr"
import moment from "moment"

const FilterForm = (props) => {
  const [selectedMeterOptions, setSelectedMeterOptions] = useState(props?.filterParams?.meter)

  const [commandList, setCommandList] = useState([])

  const [fetchingData, setFetchingData] = useState(true)

  const [meterList, setMeterList] = useState([])

  const [startDateTime, setStartDateTime] = useState(props?.filterParams?.start_date)
  const [endDateTime, setEndDateTime] = useState(props?.filterParams?.end_date)

  const [commandStatus, setCommandStatus] = useState(props?.filterParams?.execution_status)
  const [selectedCommandName, setSelectedCommandName] = useState(props?.filterParams?.command)

  const [meterListLoader, setMeterListLoader] = useState(false)
  const [commandListLoader, setcommandListLoader] = useState(false)

  const [isStartendDateSelected, setIsStartendDateSelected] = useState(true)
  const [isStartendDateRemoved, setIsStartendDateRemoved] = useState(true)
  // Set default Start date to the current date and time
  const defaultStartDate = moment().startOf("month").format("YYYY-MM-DD 00:00:00")

  // Set default end date to the current date and time
  const defaultEndDate = moment().subtract(2, "minutes").format("YYYY-MM-DD HH:mm:ss")

  const dispatch = useDispatch()
  const history = useHistory()
  const location = useLocation()
  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  // Api to fetch Meter List
  const fetchData = async (params) => {
    return await useJwt
      // meter list function
      .getGasMeterList(params)
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
  const projectName = location.pathname.split("/")[2]
  useEffect(async () => {
    if (fetchingData) {
      setMeterListLoader(true)
      let params = undefined
      params = {
        // project: "xyz"
        project: projectName === "ag&p-pratham" ? "agp-pratham" : projectName
      }
      const [statusCode, responseData] = await fetchData(params)
      if (statusCode === 200) {
        // Set response of meter list
        const res = responseData.data.data.result
        // to set meter list
        const meter_list = []
        for (const i of res) {
          meter_list.push({
            value: i["meter_serial"],
            label: i["meter_serial"]
          })
        }
        setMeterList(meter_list)

        setFetchingData(false)
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      }
      setMeterListLoader(false)
    }
  }, [fetchingData])

  // Api to fetch Command List
  const fetchCommandList = async (params) => {
    return await useJwt
      .getGasCommandList(params)
      .then((res) => {
        // console.log(res)
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
    if (fetchingData) {
      setcommandListLoader(true)
      let params = undefined
      params = {}
      const [statusCode, responseData] = await fetchCommandList()
      if (statusCode === 200) {
        // Set response of Command list
        setCommandList(responseData.data.data.result)
        // console.log(responseData.data.data.result)
        setFetchingData(false)
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      }
      setcommandListLoader(false)
    }
  }, [fetchingData])

  // on meter handle change
  const handleSelectMeterChange = (selectedValues) => {
    if (selectedValues) {
      setSelectedMeterOptions(selectedValues)
    } else {
      setSelectedMeterOptions(null)
    }
  }

  // Command Selected
  const commandSelected = (selection) => {
    if (selection) {
      setSelectedCommandName(selection)
    } else {
      setSelectedCommandName(null)
    }
  }

  // Command Status GAS COMMAND
  const execution_status_list = [
    {
      value: "IN_QUE",
      label: "IN_QUE"
    },
    {
      value: "IN_PROGRESS",
      label: "IN_PROGRESS"
    },
    {
      value: "SUCCESS",
      label: "SUCCESS"
    },
    {
      value: "DISCARDED",
      label: "DISCARDED"
    },
    {
      value: "FAILED",
      label: "FAILED"
    }
  ]

  // Command Status Selected
  const commandStatusSelected = (selection) => {
    if (selection) {
      setCommandStatus(selection)
    } else {
      setCommandStatus(null)
    }
  }

  const onDateRangeSelected = (dateRange) => {
    if (dateRange && dateRange.length === 2) {
      const startDateTime = moment(dateRange[0])
      let endDateTime = moment(dateRange[1])
      const currentDate = new Date()

      const differenceInDays = endDateTime.diff(startDateTime, "days")
      if (new Date(endDateTime)?.getDate() === currentDate?.getDate()) {
        endDateTime = moment(defaultEndDate)
      }
      if (differenceInDays <= 30) {
        setStartDateTime(startDateTime.format("YYYY-MM-DD HH:mm:ss"))
        setEndDateTime(endDateTime.format("YYYY-MM-DD HH:mm:ss"))
        setIsStartendDateSelected(true)
      } else {
        toast.error(<Toast msg={"Date range cannot be more than 30 days"} type='danger' />, {
          hideProgressBar: true
        })
        setStartDateTime(defaultStartDate)
        setEndDateTime(defaultEndDate)
        setIsStartendDateSelected(false)
      }

      // Check if either the startDateTime or endDateTime is in the future
      if (startDateTime.isAfter(currentDate) || endDateTime.isAfter(currentDate)) {
        toast.error(<Toast msg={"Cannot select Future Date"} type='danger' />, {
          hideProgressBar: true
        })
        setStartDateTime(defaultStartDate)
        setEndDateTime(defaultEndDate)
        setIsStartendDateSelected(false)
      }
    } else {
      // Handle incomplete or undefined dateRange
      if (dateRange) {
        setStartDateTime(moment(dateRange[0]).format("YYYY-MM-DD HH:mm:ss"))
      } else {
        setStartDateTime(defaultStartDate) // or any other suitable default value
      }
      if (!isStartendDateRemoved) {
        setStartDateTime(undefined)
        setEndDateTime(undefined)

        return
      }
      // console.log(dateRange)
      // setStartDateTime(defaultStartDate)
      setEndDateTime(undefined)
      setIsStartendDateSelected(false)
    }
  }

  // console.log(isStartendDateSelected)
  const onApplyButtonClicked = () => {
    setIsStartendDateRemoved(true)
    if (!isStartendDateSelected) {
      if (startDateTime && !endDateTime) {
        // Show toast warning for selecting end date
        toast.error(<Toast msg={"Please select End Date ."} type='danger' />, {
          hideProgressBar: true
        })
        return false
      }
      // Prevent further execution
    }
    const values = {
      meter: selectedMeterOptions,
      command: selectedCommandName,
      execution_status: commandStatus,
      start_date: startDateTime,
      end_date: endDateTime
    }

    props.appliedFilterParams(values)
  }

  const onResetButtonClicked = () => {
    setSelectedMeterOptions(null)
    setSelectedCommandName(null)
    setCommandStatus(null)
    setStartDateTime()
    setEndDateTime()
    setIsStartendDateSelected(true)
    props.setfilterParams({})
    props.onResetButtonClicked()
  }
  return (
    <>
      <Row className='mb-1'>
        <Col sm='12' className='mb-2'>
          {/* Select Meters  */}
          <Select
            id='meter'
            theme={selectThemeColors}
            className='react-select border-secondary rounded'
            classNamePrefix='select'
            options={meterList}
            onChange={handleSelectMeterChange}
            isClearable={false}
            placeholder={meterListLoader ? "Loading..." : "Select Meters ...."}
            closeMenuOnSelect={false}
            isDisabled={meterListLoader}
            value={selectedMeterOptions}
            isMulti
          />
        </Col>

        {/* Select Command Name */}
        <Col sm='12' className='mb-2'>
          <Select
            isClearable={true}
            closeMenuOnSelect={true}
            onChange={commandSelected}
            value={selectedCommandName}
            isSearchable
            options={commandList}
            isDisabled={commandListLoader}
            className='react-select border-secondary rounded'
            classNamePrefix='select'
            placeholder={commandListLoader ? "Loading..." : "Select command name ..."}
          />
        </Col>

        {/* Select Command Status */}
        <Col sm='12' className='mb-2'>
          <Select
            isClearable={true}
            closeMenuOnSelect={true}
            isSearchable
            onChange={commandStatusSelected}
            value={commandStatus}
            options={execution_status_list}
            className='react-select border-secondary rounded'
            classNamePrefix='select'
            placeholder='Select command status ...'
          />
        </Col>

        {/* start and end date  */}
        <Col sm='12' className='mb-1'>
          <Flatpickr
            placeholder='Select date ...'
            onChange={onDateRangeSelected}
            className='form-control border-secondary rounded'
            value={[startDateTime, endDateTime]}
            onKeyDown={(key) => {
              if (key.keyCode === 8 || key.keyCode === 46) {
                setIsStartendDateRemoved(false)
              }
              key.preventDefault()
            }}
            options={{ mode: "range", enableTime: true, time_24hr: true }}
          />
        </Col>

        {/* Apply Button */}
        <Col sm='6' className='mb-2'>
          <Button.Ripple className='btn-block' color='primary' onClick={onApplyButtonClicked}>
            Apply
          </Button.Ripple>
        </Col>

        {/* Reset Button */}
        <Col sm='6' className='mb-2'>
          <Button.Ripple className='btn-block' color='primary' onClick={onResetButtonClicked}>
            Reset
          </Button.Ripple>
        </Col>
      </Row>
    </>
  )
}

export default FilterForm
