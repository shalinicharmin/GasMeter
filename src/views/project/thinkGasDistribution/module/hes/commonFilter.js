import React, { useState, useEffect } from "react"
import { Button, Col, Input, Row } from "reactstrap"
import Flatpickr from "react-flatpickr"
import moment from "moment"
import { toast } from "react-toastify"
import Toast from "@src/views/ui-elements/cards/actions/createToast"
import useJwt from "@src/auth/jwt/useJwt"
import Select from "react-select"
import { selectThemeColors } from "@utils"
import { useHistory, useLocation } from "react-router-dom"

const CommonFilter = (props) => {
  const [meterSearch, setMeterSearch] = useState(undefined)
  const defaultStartDate = moment().startOf("month").format("YYYY-MM-DD 00:00:00")

  // Set default end date to the current date and time
  const defaultEndDate = moment().subtract(2, "minutes").format("YYYY-MM-DD HH:mm:ss")

  const [startDateTime, setStartDateTime] = useState(
    !props.hideCommandStatusFilter ? "" : defaultStartDate
  )
  const [endDateTime, setEndDateTime] = useState(
    !props.hideCommandStatusFilter ? "" : defaultEndDate
  )
  const [commandStatus, setCommandStatus] = useState(null)
  const [isStartendDateSelected, setIsStartendDateSelected] = useState(true)
  const [isStartendDateRemoved, setIsStartendDateRemoved] = useState(true)
  const [fetchingData, setFetchingData] = useState(true)
  const [meterList, setMeterList] = useState([])
  const [meterListLoader, setMeterListLoader] = useState(false)
  const [selectedMeterOptions, setSelectedMeterOptions] = useState("")

  const location = useLocation()
  // Command Status GAS COMMAND
  const execution_status_list = [
    {
      value: "IN_QUEUE",
      label: "IN_QUEUE"
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

  // on meter handle change
  const handleSelectMeterChange = (selectedValues) => {
    if (selectedValues) {
      setSelectedMeterOptions(selectedValues)
    } else {
      setSelectedMeterOptions(null)
    }
  }

  const onDateRangeSelected = (dateRange) => {
    const currentDate = new Date()

    if (dateRange && dateRange.length === 2) {
      const startDateTime = moment(dateRange[0])
      let endDateTime = moment(dateRange[1])

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
      if (dateRange && dateRange[0]) {
        setStartDateTime(moment(dateRange[0]).format("YYYY-MM-DD HH:mm:ss"))
      } else {
        setStartDateTime(defaultStartDate) // or any other suitable default value
      }

      if (!isStartendDateRemoved) {
        setStartDateTime(undefined)
        setEndDateTime(undefined)

        return
      }
      setEndDateTime(undefined)
      setIsStartendDateSelected(false)
    }
  }

  // Command Status Selected
  const commandStatusSelected = (selection) => {
    if (selection) {
      setCommandStatus(selection)
    } else {
      setCommandStatus(null)
    }
  }
  // console.log(isStartendDateSelected)
  // console.log(startDateTime, endDateTime)

  const Submitresponse = () => {
    setIsStartendDateRemoved(true)
    if (!isStartendDateSelected) {
      if (startDateTime && !endDateTime) {
        toast.error(<Toast msg='Please select End Date Time' type='danger' />, {
          hideProgressBar: true
        })

        return
      }
    }

    const meterList = selectedMeterOptions?.map((list) => {
      return list.value
    })
    const params = {
      meter: meterList,
      start_date: startDateTime,
      end_date: endDateTime
    }
    // if (!startDateTime) {
    //   // Show toast warning for selecting end date
    //   toast.error(<Toast msg={"Please select  Date ."} type='danger' />, {
    //     hideProgressBar: true
    //   })
    //   return false
    // } else {
    //   params["start_date"] = startDateTime
    //   params["end_date"] = endDateTime
    // }
    if (!props.hideCommandStatusFilter) {
      params.execution_status = commandStatus?.value
    }

    // console.log(params) // Log the params object before submitting

    props.onSubmitButtonClicked(params)
  }

  return (
    <>
      <Row>
        <Col lg='3' sm='6' className='mb-1'>
          {/* Select Meters  */}
          <Select
            id='meter'
            theme={selectThemeColors}
            className='react-select border-secondary rounded zindex_1000'
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
        {/* Select Command Status */}
        {!props.hideCommandStatusFilter && (
          <Col lg='3' sm='6' className='mb-2'>
            <Select
              isClearable={true}
              closeMenuOnSelect={true}
              isSearchable
              onChange={commandStatusSelected}
              value={commandStatus}
              options={execution_status_list}
              className='react-select  rounded zindex_1003'
              classNamePrefix='select'
              placeholder='Select command status ...'
            />
          </Col>
        )}
        <Col lg='3' sm='6' className='mb-1'>
          <Flatpickr
            placeholder='Select date ...'
            onChange={onDateRangeSelected}
            className='form-control'
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

        <Col lg='2' sm='5'>
          <Button color='primary' className='btn-block ' onClick={Submitresponse}>
            Submit
          </Button>
        </Col>
      </Row>
    </>
  )
}

export default CommonFilter
