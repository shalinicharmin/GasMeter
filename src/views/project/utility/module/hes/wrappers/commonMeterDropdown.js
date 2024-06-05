import { Col, CardHeader, CardBody, CardTitle, Card, Button, Row, Label, Input } from "reactstrap"
import Select from "react-select"
import useJwt from "@src/auth/jwt/useJwt"
import { selectThemeColors } from "@utils"
import moment from "moment"
import { toast } from "react-toastify"
import Toast from "@src/views/ui-elements/cards/actions/createToast"
import Flatpickr from "react-flatpickr"
// import { useSelector } from 'react-redux'
import { useState, useEffect, useRef } from "react"

import { useHistory, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import authLogout from "../../../../../../auth/jwt/logoutlogic"

import { handleCurrentSelectedModuleStatus } from "@store/actions/Misc/currentSelectedModuleStatus"

import { getDefaultDateTimeRange } from "../../../../../../utility/Utils"

const CommonMeterDropdown = (props) => {
  const location = useLocation()
  const defaultDateTime = getDefaultDateTimeRange()

  const dispatch = useDispatch()
  const history = useHistory()

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  // const responseData = useSelector(state => state.UtilityMdmsFlowReducer)
  const responseData = useSelector((state) => state.UtilityMDASAssetListReducer)

  const [dtr, setDtr] = useState([])

  const [meter, setMeter] = useState(undefined)
  const [meterSearch, setMeterSearch] = useState(undefined)
  const [params, setParams] = useState({})
  const [showDTRDropDown, setShowDTRDropDown] = useState(false)
  const [meterList, setMeterList] = useState(undefined)
  const [meterListLoader, setmeterListLoader] = useState(false)
  const [selectedMeter, setSelectedMeter] = useState(null)
  const [selectedDTR, setSelectedDTR] = useState(undefined)

  const [inputType, setInputType] = useState()
  const [dtrCount, setDTRCount] = useState(undefined)

  // Set default Start date to the current date and time
  const defaultBillingStartDate = moment().startOf("month").format("YYYY-MM-DD 00:00:00")
  const defaultStartDate = moment().subtract(1, "days").startOf("day").format("YYYY-MM-DD 00:00:00") // Yesterday, start of day
  // Set default end date to the current date and time
  const defaultEndDate = moment().format("YYYY-MM-DD HH:mm:ss")
  const [startDateTime, setStartDateTime] = useState(
    props.billingData ? defaultBillingStartDate : defaultStartDate
  )
  const [endDateTime, setEndDateTime] = useState(defaultEndDate)

  const [selected_project, set_selected_project] = useState(undefined)
  const currentSelectedModuleStatus = useSelector(
    (state) => state.CurrentSelectedModuleStatusReducer.responseData
  )

  const [disableDTRDropdown, setDisableDTRDropdown] = useState(false)
  const [disableMeterDropDown, setDisableMeterDropDown] = useState(false)
  const [disableMeterSearch, setDisableMeterSearch] = useState(false)

  const fetchAssetData = async (params) => {
    return await useJwt
      .getGISAssetsTillDTR(params)
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

  const fetchMeterListForSelectedDTR = async (params) => {
    // API Call to fetch Meter List
    return await useJwt
      .getGISDTRMeterList(params)
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

  if (currentSelectedModuleStatus.prev_project) {
    if (
      selected_project !== currentSelectedModuleStatus.project &&
      currentSelectedModuleStatus.prev_project !== currentSelectedModuleStatus.project
    ) {
      set_selected_project(currentSelectedModuleStatus.project)
      setSelectedDTR([])
      setSelectedMeter(null)
      setStartDateTime()
    }
  }

  // const metersList = {}
  // // for (let i = 0; i < selectedDTR; i++) {
  // // metersList.push({
  // metersList = {
  //   name: "meter",
  //   meter_serial: meter,
  //   value: {
  //     pss_id: selectedDTR?.["pss_id"],
  //     feeder_id: selectedDTR?.["feeder_id"],
  //     site_id: selectedDTR?.["value"],
  //     meter_serial: meter,
  //     protocol: "dlms",
  //     project:
  //       location.pathname.split('/')[2] === "sbpdcl" ? "ipcl" : location.pathname.split('/')[2],
  //     protocol_type: "dlms"
  //   }
  // }
  // command: commandName,
  // args: {
  //   value: val,
  //   input_type: inpt,
  //   mode: mod
  // }
  // })
  // }

  useEffect(async () => {
    setDtr([])
    const params = {
      project:
        location.pathname.split("/")[2] === "sbpdcl" ? "ipcl" : location.pathname.split("/")[2],
      site_id: selectedDTR?.["value"]
    }
    const [statusCode, response] = await fetchAssetData(params)
    const dtrList = []
    const pss_list = []
    const feeder_list = []
    if (statusCode) {
      if (statusCode === 200) {
        const data = response.data.data.result.stat
        for (const pss of data["pss_list"]) {
          const temp = {}
          temp["pss_name"] = pss["pss_name"]
          temp["pss_id"] = pss["pss_id"]

          pss_list.push(temp)
        }

        // Create Feeder list
        // const feeder_list = []
        for (const feeder of data["feeder_list"]) {
          const temp = {}
          const parent_pss = feeder["pss_id"]
          for (const pss of pss_list) {
            if (pss["pss_id"] === parent_pss) {
              temp["feeder_name"] = feeder["feeder_name"]
              temp["feeder_id"] = feeder["feeder_id"]
              temp["pss_name"] = pss["pss_name"]
              temp["pss_id"] = pss["pss_id"]
              feeder_list.push(temp)
            }
          }
        }
        // Create DTR List

        for (const dtr of data["live_dt_list"]) {
          const temp = {}
          const parent_feeder = dtr["feeder_id"]
          for (const feeder of feeder_list) {
            if (feeder["feeder_id"] === parent_feeder) {
              temp["feeder_name"] = feeder["feeder_name"]
              temp["feeder_id"] = feeder["feeder_id"]
              temp["pss_name"] = feeder["pss_name"]
              temp["pss_id"] = feeder["pss_id"]
              temp["dtr_name"] = dtr["site_name"]
              temp["dtr_id"] = dtr["site_id"]
              dtrList.push(temp)
            }
          }
        }
      }
    }

    // Condition to check whether to show DTR DropDown or not
    // if (dtrCount && dtrCount === 1) {
    //   // Donot Show DTR DropDown
    //   setShowDTRDropDown(false)

    //   // Set only dtr as selected DTR
    //   const temp_dtr = responseData.responseData.dtr_list
    //   // console.log(temp_dtr)
    //   const temp = {}
    //   temp['value'] = temp_dtr[0]['dtr_id']
    //   temp['label'] = temp_dtr[0]['dtr_name']
    //   temp['pss_id'] = temp_dtr[0]['pss_id']
    //   temp['feeder_id'] = temp_dtr[0]['feeder_id']
    //   temp['isFixed'] = 'true'

    //   const temp_selected_dtr = []
    //   temp_selected_dtr.push(temp)
    //   setSelectedDTR(temp_selected_dtr)
    // } else if (dtrCount && !dtr) {
    //   // Show DTR DropDown
    //   setShowDTRDropDown(true)

    //   const temp_dtr = []
    //   const dtr_list = responseData.responseData.dtr_list

    //   if (dtr_list.length > 0) {
    //     for (const ele of dtr_list) {
    //       const temp = {}
    //       temp['value'] = ele['dtr_id']
    //       temp['label'] = ele['dtr_name']
    //       temp['pss_id'] = ele['pss_id']
    //       temp['feeder_id'] = ele['feeder_id']
    //       temp['isFixed'] = 'true'
    //       temp_dtr.push(temp)
    //     }
    //     setDtr(temp_dtr)
    //   }
    // }

    setShowDTRDropDown(true)

    const temp_dtr = []
    const dtr_list = dtrList
    if (dtr_list.length > 0) {
      for (const ele of dtr_list) {
        const temp = {}
        temp["value"] = ele["dtr_id"]
        temp["label"] = ele["dtr_name"]
        temp["pss_id"] = ele["pss_id"]
        temp["feeder_id"] = ele["feeder_id"]
        temp["isFixed"] = "true"
        temp_dtr.push(temp)
      }
      setDtr(temp_dtr)

      // if (props.defaultSelectedDTR) {
      //   props?.set_dtr(temp_dtr[1].value)
      //   setSelectedDTR(temp_dtr[1])
      // }
    }
  }, [location.pathname])

  // UseEffect to fetch Meter List for Selected DTR from Dropdown
  useEffect(async () => {
    if (selectedDTR) {
      setmeterListLoader(true)
      const params = {
        project:
          location.pathname.split("/")[2] === "sbpdcl" ? "ipcl" : location.pathname.split("/")[2],
        site_id: selectedDTR?.["value"]
      }

      // Fetch Meter List
      const [statusCode, response] = await fetchMeterListForSelectedDTR(params)

      if (statusCode) {
        if (statusCode === 401 || statusCode === 403) {
          setLogout(true)
        } else {
          // Construct Meter List for DropDown
          const temp_meter_list = response.data.data.result.stat.meters

          const meter_list = []
          for (let i = 0; i < temp_meter_list.length; i++) {
            const temp_meter = {}
            temp_meter["value"] = temp_meter_list[i]["meter_number"]
            temp_meter["label"] = temp_meter_list[i]["meter_number"]
            temp_meter["isFixed"] = "true"
            meter_list.push(temp_meter)
          }

          setMeterList(meter_list)
        }
      }
      setmeterListLoader(false)
    } else {
      setMeter(undefined)
      setMeterList(undefined)
    }
  }, [selectedDTR])

  const onDtrSelected = (selectedOption) => {
    if (selectedOption) {
      setSelectedDTR(selectedOption)
      setSelectedMeter(null)
      setDisableMeterSearch(true)
    } else {
      setSelectedDTR(undefined)
      setSelectedMeter(null)
      setMeter(undefined)
      setMeterList(undefined)
      setDisableMeterSearch(false)
    }
  }

  const onMeterSelected = (selectedOption) => {
    if (selectedOption) {
      setMeter(selectedOption["value"])
      setInputType(null)
      setParams({})
      setSelectedMeter(selectedOption)
      // setStartDateTime(undefined)
      // setEndDateTime(undefined)
    } else {
      setMeter(undefined)

      setInputType(null)
      setParams({})
      setSelectedMeter(null)
    }
  }

  const handleMeterSearchChange = (event) => {
    if (event.target.value) {
      // console.log('text available ....')
      setMeterSearch(event.target.value)
      // Disable Meter and DTR Dropdown
      if (!disableMeterDropDown) {
        setDisableDTRDropdown(true)
        setDisableMeterDropDown(true)
      }
    } else {
      setMeterSearch(undefined)
      setDisableDTRDropdown(false)
      setDisableMeterDropDown(false)

      // console.log('No Text Available .....')
    }
  }

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

  // const onDateRangeSelected = (dateRange) => {
  //   if (dateRange.length === 2) {
  //     const startDateTime = moment(dateRange[0])
  //     const endDateTime = moment(dateRange[1])

  //     const difference_in_days = endDateTime.diff(startDateTime, "days")

  //     if (difference_in_days <= 30) {
  //       setStartDateTime(startDateTime)
  //       setEndDateTime(endDateTime)
  //     } else {
  //       toast.error(<Toast msg={"Date range cannot be more than 30 days"} type='danger' />, {
  //         hideProgressBar: true
  //       })
  //     }
  //   }
  // }

  const onDateRangeSelected = (dateRange) => {
    const currentDate = new Date() // Get the current date and time
    const startDateTime = moment(dateRange[0])
    const endDateTime = moment(dateRange[1])
    if (dateRange && dateRange.length === 2) {
      // Check if either the startDateTime or endDateTime is in the future
      if (startDateTime.isAfter(currentDate) || endDateTime.isAfter(currentDate)) {
        setStartDateTime(defaultStartDate)
        setEndDateTime(defaultEndDate)
      }
      const differenceInDays = endDateTime.diff(startDateTime, "days")
      if (differenceInDays <= 30) {
        setStartDateTime(startDateTime.format("YYYY-MM-DD HH:mm:ss"))
        setEndDateTime(endDateTime.format("YYYY-MM-DD HH:mm:ss"))
      } else {
        // setStartDateTime(defaultDateTime.startDateTime);
        // setEndDateTime(defaultDateTime.endDateTime);
        toast.error(<Toast msg={"Date range cannot be more than 30 days"} type='danger' />, {
          hideProgressBar: true
        })
      }
    }
  }

  const Submitresponse = () => {
    // console.log('On Submit Button clicked...')
    const params = {}

    if (selectedDTR) {
      params["site"] = selectedDTR?.value
    } else {
      // If No Site Selected, add all sites access available
      const dtr_list = ""
      // for (let i = 0; i < responseData.responseData.dtr_list.length; i++) {
      //   dtr_list += `${responseData.responseData.dtr_list[i]['id']},`
      // }
      params["site"] = dtr_list
    }

    if (meter) {
      params["meter"] = meter
    }
    if (meterSearch) {
      params["meter"] = meterSearch
    }

    if (!props.hideDateRangeSelector) {
      if (startDateTime && !endDateTime) {
        // console.log(startDateTime)
        // console.log(endDateTime)
        toast.error(<Toast msg='Please select End Date Time' type='danger' />, {
          hideProgressBar: true
        })
        return
      } else if (startDateTime && endDateTime) {
        params["start_date"] = startDateTime
        params["end_date"] = endDateTime
      }
    }

    props.onSubmitButtonClicked(params)
  }

  return (
    <>
      <Row>
        {showDTRDropDown && (
          <Col lg='3' sm='6' className='mb-1'>
            <Select
              isClearable={true}
              onChange={onDtrSelected}
              isSearchable
              options={dtr}
              value={selectedDTR}
              isDisabled={disableDTRDropdown}
              className='react-select rounded zindex_1003'
              classNamePrefix='select'
              placeholder='Select site ...'
            />
          </Col>
        )}

        {!props.hideMeterSelector && (
          <Col lg='3' sm='6' className='mb-1'>
            <Select
              isClearable={true}
              onChange={onMeterSelected}
              options={meterList}
              maxMenuHeight={200}
              value={selectedMeter}
              isDisabled={disableMeterDropDown || meterListLoader}
              isSearchable
              className='react-select zindex_1002'
              classNamePrefix='select'
              placeholder={meterListLoader ? "Loading..." : "Select meter ..."}
            />
          </Col>
        )}

        {!props.hideMeterSearch && (
          <Col lg='3' sm='6' className='mb-1'>
            <Input
              type='number'
              onChange={handleMeterSearchChange}
              disabled={disableMeterSearch}
              placeholder='Search for meter number'
            />
          </Col>
        )}

        {!props.hideDateRangeSelector && (
          <Col lg='3' sm='6' className='mb-1'>
            <Flatpickr
              placeholder='Select date ...'
              onChange={onDateRangeSelected}
              className='form-control'
              value={[startDateTime, endDateTime]}
              options={{ mode: "range", enableTime: true, time_24hr: true }}
            />
          </Col>
        )}

        <Col lg='2' sm='5'>
          <Button color='primary' className='btn-block ' onClick={Submitresponse}>
            Submit
          </Button>
        </Col>
      </Row>
    </>
  )
}

export default CommonMeterDropdown
