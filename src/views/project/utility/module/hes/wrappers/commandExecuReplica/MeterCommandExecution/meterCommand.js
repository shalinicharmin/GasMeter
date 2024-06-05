import React, { useEffect, useState } from "react"
// import { useSelector } from 'react-redux'
import { Button, Col, Input, Row, Label, FormGroup, CardFooter, Card } from "reactstrap"
import useJwt from "@src/auth/jwt/useJwt"

import { selectThemeColors } from "@utils"
import Select from "react-select"

import Flatpickr from "react-flatpickr"
import "@styles/react/libs/flatpickr/flatpickr.scss"

import Nouislider from "nouislider-react"
import "@styles/react/libs/noui-slider/noui-slider.scss"

import { toast } from "react-toastify"
import Toast from "@src/views/ui-elements/cards/actions/createToast"

import moment from "moment"

import { useDispatch, useSelector } from "react-redux"
import { useLocation, useHistory } from "react-router-dom"

import { ArrowLeft } from "react-feather"
// import authLogout from '../../../../../../../../auth/jwt/logoutlogic'
import CardInfo from "@src/views/ui-elements/cards/actions/cardInfo"

const MeterCommand = (props) => {
  const { tableData, setTableData, projectName } = props

  const dispatch = useDispatch()
  const history = useHistory()

  // Logout User
  const [logout, setLogout] = useState(false)
  const [hasError, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [retry, setRetry] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const dlmsCommandList = useSelector((state) => state.UtilityMDASDlmsCommandReducer)
  const tapCommandList = useSelector((state) => state.UtilityMDASTapCommandReducer)

  const [params, setParams] = useState({})
  const [extraParams, setExtraParams] = useState({})
  const [selectedCommand, setSelectedCommand] = useState()

  const [inputType, setInputType] = useState()
  const [datePicker, setDatePicker] = useState()
  const [valuePicker, setValuePicker] = useState("")
  const [toValue, setToValue] = useState()
  const [toTime, setToTime] = useState()
  const [rangePicker, setRangePicker] = useState([0, 0])
  const [activeCal1, setActiveCal1] = useState()
  const [activeCal2, setActiveCal2] = useState()
  const [activeCal3, setActiveCal3] = useState()
  const [activeCal4, setActiveCal4] = useState()
  const [activeCal5, setActiveCal5] = useState()
  const [activeCal6, setActiveCal6] = useState()
  const [activeCal7, setActiveCal7] = useState()
  const [activeCal8, setActiveCal8] = useState()
  const [selectiveAccess, setSelectiveAccess] = useState(true)
  const [isSelect, setIsSelect] = useState(true)
  const [selectedESW, setSelectedESW] = useState()
  const [loader, setLoader] = useState(false)

  // Local State to store Protocols
  const [protocols, setProtocols] = useState([
    { value: "dlms", label: "Protocol 1" }
    // { value: 'tap', label: 'Protocol 2' }
  ])

  // Local State to maintain Selected Protocol
  const [selectedProtocol, setSelectedProtocol] = useState()

  // Local State to maintain Selected Protocol Command List
  const [commandList, setCommandList] = useState([])

  const postCommandExecutionRequestDLMS = async (jsonBody) => {
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

  const postCommandExecutionRequestTAP = async (jsonBody) => {
    return await useJwt
      .postMdasTapCommandExecution(jsonBody)
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

  const resetDefault = () => {
    setDatePicker()
    setRangePicker([0, 0])
    setValuePicker("")
    setToValue()
    setToTime()
    setActiveCal1()
    setActiveCal2()
    setActiveCal3()
    setActiveCal4()
    setActiveCal5()
    setActiveCal6()
    setActiveCal7()
    setActiveCal8()
    setSelectedESW()
    setSelectiveAccess(false)
  }

  // on click function of apply button to submit command
  const submitCommmandRequest = async () => {
    // Validation procedure
    if (!selectedCommand) {
      toast.error(<Toast msg='Please select command.' type='danger' />, { hideProgressBar: true })
      return false
    } else if (inputType) {
      if (inputType.includes("date") || inputType.includes("time")) {
        if (inputType === "timeRange" || inputType === "dateTimeRange") {
          if (selectedCommand["command_type"] === "MR") {
            if ((!datePicker && toTime) || (datePicker && !toTime)) {
              toast.error(<Toast msg='Please select Time range.' type='danger' />, {
                hideProgressBar: true
              })
              return false
            }
          }
          const currentDate = new Date()
          const selectedDate = new Date(datePicker) // Assuming datePicker contains the selected date
          const selectedTime = new Date(toTime)

          // Check if the selected date is the current date and the selected time is greater than the current time
          if (selectedDate.toDateString() !== currentDate.toDateString()) {
            // Check if the selected time is greater than 00:00 (midnight)
            const midnight = new Date(currentDate)
            midnight.setHours(0, 0, 0, 0) // Set time to 00:00:00:000

            if (selectedTime > midnight) {
              toast.error(<Toast msg='Time must be 00:00 for current date' type='danger' />, {
                hideProgressBar: true
              })
              return false
            }
          }
        }
        if (!datePicker) {
          toast.error(<Toast msg='Please select Date.' type='danger' />, { hideProgressBar: true })
          return false
        }
      } else if (
        inputType === "range" &&
        !rangePicker &&
        selectedCommand["command_type"] !== "MR"
      ) {
        toast.error(<Toast msg='Please select input range.' type='danger' />, {
          hideProgressBar: true
        })
        return false
      } else if (
        (inputType === "text" || inputType === "number") &&
        !valuePicker &&
        valuePicker < 0
      ) {
        toast.error(<Toast msg='Please insert input value.' type='danger' />, {
          hideProgressBar: true
        })
        return false
      } else if (inputType === "numberRange" && (!valuePicker || !toValue)) {
        toast.error(<Toast msg='Please insert number range.' type='danger' />, {
          hideProgressBar: true
        })
        return false
      } else if (
        (inputType === "activityCal1ph" || inputType === "activityCal3ph") &&
        (!activeCal1 || !activeCal2)
      ) {
        toast.error(<Toast msg='First and second tod must be selected.' type='danger' />, {
          hideProgressBar: true
        })
        return false
      } else if ((inputType === "select_text" || inputType === "select_number") && !selectedESW) {
        toast.error(<Toast msg='Please select at lease one the ESW filter.' type='danger' />, {
          hideProgressBar: true
        })
        return false
      }
    }

    const [selectedMetersList, commandName] = [[], selectedCommand.value]
    let [val, mod, inpt] = ["", "", ""]

    // Value according to POST payload
    if (inputType) {
      if (inputType.includes("date") || inputType.includes("time")) {
        if (inputType === "timeRange") {
          const [from, to] = [
            moment(datePicker[0]).format("HH:mm:ss"),
            moment(toTime[0]).format("HH:mm:ss")
          ]
          val = { from, to }
          mod = "range"
          inpt = "time"
        } else if (inputType === "dateTimeRange") {
          if (selectedCommand["command_type"] === "MR") {
            if (datePicker && toTime) {
              const [from, to] = [
                moment(datePicker[0]).format("YYYY-MM-DD HH:mm:ss"),
                moment(toTime[0]).format("YYYY-MM-DD HH:mm:ss")
              ]
              val = { from, to }
              mod = "range"
              inpt = "date"
            }
          } else {
            const [from, to] = [
              moment(datePicker[0]).format("YYYY-MM-DD HH:mm:ss"),
              moment(toTime[0]).format("YYYY-MM-DD HH:mm:ss")
            ]
            val = { from, to }
            mod = "range"
            inpt = "date"
          }
        } else if (datePicker) {
          const [from, to] = [
            moment(datePicker[0]).format("YYYY-MM-DD HH:mm:ss"),
            moment(datePicker[1]).format("YYYY-MM-DD HH:mm:ss")
          ]
          val = datePicker[1] ? { from, to } : from
          mod = params.mode ? params.mode : ""
          inpt = "date"
        }
      } else if (inputType === "range") {
        if (selectedCommand["command_type"] === "MR") {
          if (rangePicker) {
            val = { from: parseInt(rangePicker[0]), to: parseInt(rangePicker[1]) }
            mod = "range"
            inpt = "number"
          }
        } else if (rangePicker) {
          val = { from: parseInt(rangePicker[0]), to: parseInt(rangePicker[1]) }
          mod = "range"
          inpt = "number"
        }
      } else if (inputType === "text" || inputType === "number") {
        val = valuePicker
        mod = params.mode ? params.mode : ""
        inpt = inputType
      } else if (inputType === "numberRange") {
        val = { from: parseInt(valuePicker), to: parseInt(toValue) }
        mod = "range"
        inpt = "number"
      } else if (inputType === "activityCal1ph") {
        const [tod1, tod2, tod3, tod4] = [
          moment(activeCal1[0]).format("HH:mm:ss"),
          moment(activeCal2[0]).format("HH:mm:ss"),
          activeCal3 ? moment(activeCal3[0]).format("HH:mm:ss") : "-",
          activeCal4 ? moment(activeCal4[0]).format("HH:mm:ss") : "-"
        ]
        val = [tod1, tod2, tod3, tod4]
        mod = "multi"
        inpt = "date"
      } else if (inputType === "activityCal3ph") {
        const [tod1, tod2, tod3, tod4, tod5, tod6, tod7, tod8] = [
          moment(activeCal1[0]).format("HH:mm:ss"),
          moment(activeCal2[0]).format("HH:mm:ss"),
          activeCal3 ? moment(activeCal3[0]).format("HH:mm:ss") : "-",
          activeCal4 ? moment(activeCal4[0]).format("HH:mm:ss") : "-",
          activeCal5 ? moment(activeCal5[0]).format("HH:mm:ss") : "-",
          activeCal6 ? moment(activeCal6[0]).format("HH:mm:ss") : "-",
          activeCal7 ? moment(activeCal7[0]).format("HH:mm:ss") : "-",
          activeCal8 ? moment(activeCal8[0]).format("HH:mm:ss") : "-"
        ]
        val = [tod1, tod2, tod3, tod4, tod5, tod6, tod7, tod8]
        mod = "multi"
        inpt = "date"
      } else if (inputType === "select_text" || inputType === "select_number") {
        if (params.isMulti) {
          const selectedVal = []
          for (const i of selectedESW) {
            selectedVal.push(i.value)
          }
          val = selectedVal
          mod = "multi"
          inpt = inputType.split("_")[1]
        } else {
          val = selectedESW.value
          mod = ""
          inpt = inputType.split("_")[1]
        }
      }
    }

    // Create the payload and payload forr post request
    for (const i of tableData) {
      let argsValue
      if (commandName === "EVENTS") {
        argsValue = {
          value: {
            from: 0,
            to: 50
          },
          input_type: "number",
          mode: "range"
        }
      } else {
        // Use the original args value for other commands
        argsValue = {
          value: val,
          input_type: inpt,
          mode: mod
        }
      }

      selectedMetersList.push({
        name: "meter",
        meter_serial: i.meter_number,
        value: {
          pss_id: i.pss_id,
          pss_name: i.pss_name,
          feeder_id: i.feeder_id,
          feeder_name: i.feeder_name,
          site_id: i.site_id,
          site_name: i.site_name,
          meter_address: i.meter_address,
          grid_id: i.grid_id,
          meter_sw_version: i.meter_sw_version,
          meter_serial: i.meter_number,
          protocol: selectedProtocol.value === "dlms" ? "dlms" : "tap",
          project: projectName,
          protocol_type:
            commandName === "FW_UPGRADE" || commandName === "FW_ACTIVATE"
              ? "dlms"
              : i.meter_protocol_type
        },
        command: commandName,
        args: argsValue
      })
    }

    console.log(selectedMetersList)

    let [statusCode, response] = [undefined, undefined]
    setLoader(true)
    if (selectedProtocol.value === "dlms") {
      // Post requst with payload
      ;[statusCode, response] = await postCommandExecutionRequestDLMS({ data: selectedMetersList })
    } else {
      // Post requst with payload
      ;[statusCode, response] = await postCommandExecutionRequestTAP({ data: selectedMetersList })
    }

    if (statusCode && statusCode === 201) {
      document.getElementById("preMeterButton").click()

      resetDefault()
      setSelectedCommand("")
      setSelectedProtocol([])
      // setSelectedProtocol('')
      // setMeter([])
      // setSelectedDTR([])
      props.refreshCommandHistory()
      props.toggleCommandExecutionModal()
      // props.protocolSelectedForCommandExecution(selectedProtocol)
      toast.success(<Toast msg='Command sent to meter successfully.' type='success' />, {
        hideProgressBar: true
      })

      // Back to wizard first tab
      // document.getElementById('preButton').click()

      // setTableData([])
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
    setLoader(false)
  }

  useEffect(async () => {
    resetDefault()
    if (selectedCommand) {
      if (selectedCommand["command_type"] === "MR" && selectedCommand.input_type) {
        // Check if the from time and to time exist
        if (document.getElementById("timeFrom")) {
          const from = document.getElementById("timeFrom")
          const to = document.getElementById("timeTo")
          from._flatpickr.clear()
          to._flatpickr.clear()
        }
        setSelectiveAccess(true)
        if (isSelect) {
          setInputType(selectedCommand.input_type)
          setParams(selectedCommand.params)
        } else {
          setInputType(null)
          setParams({})
        }
      } else {
        // setIsSelect(false)
        // setSelectiveAccess(false)
        setInputType(selectedCommand.input_type)
        setParams(selectedCommand.params)
      }
    } else {
      setInputType(null)
      setParams({})
    }
  }, [selectedCommand, isSelect])

  const timeChangeHandler = async (value) => {
    setDatePicker(value)
    setExtraParams({
      minDate: value[0]
    })

    const to = document.getElementById("timeTo")
    to._flatpickr.clear()
  }

  const fromNumberChangeHandler = async (event) => {
    try {
      if (inputType.includes("number")) {
        const { value, min, max } = event.target
        const val = Math.max(Number(min), Math.min(Number(max), Number(value)))

        setValuePicker(val)
      } else {
        setValuePicker(event.target.value)
      }
    } catch (err) {}
  }

  const toNumberChangeHandler = async (event) => {
    try {
      const { value, min, max } = event.target
      const val = Math.max(Number(min), Math.min(Number(max), Number(value)))

      setToValue(val)
    } catch (err) {}
  }
  // on Protocol Selected
  const onProtocolSelected = (selectedOption) => {
    if (selectedOption) {
      setSelectedCommand(null)
      setSelectedProtocol(selectedOption)

      if (selectedOption.value === "dlms") {
        if (dlmsCommandList.responseData.length > 0) {
          setCommandList(dlmsCommandList.responseData)
        }
      } else if (selectedOption.value === "tap") {
        if (tapCommandList.responseData.length > 0) {
          setCommandList(tapCommandList.responseData)
        }
      }
    } else {
      setCommandList([])
      setSelectedCommand(null)
      setSelectedProtocol([])
    }
  }

  return (
    <>
      <Card>
        <Row>
          <Col lg='5' md='6' xs='12' className='mb-1'>
            {/* Protocol Selection */}
            <Select
              isClearable={true}
              theme={selectThemeColors}
              onChange={onProtocolSelected}
              value={selectedProtocol}
              options={protocols}
              isSearchable
              isMulti={false}
              className='react-select border-secondary rounded zindex_1001'
              classNamePrefix='select'
              placeholder='Protocol ...'
            />
          </Col>
          <Col lg='5' md='6' xs='12' className='mb-1'>
            {/* Command Selection */}
            <Select
              isClearable={true}
              onChange={setSelectedCommand}
              options={commandList}
              value={selectedCommand}
              className='react-select zindex_999'
              classNamePrefix='select'
              placeholder='Select command ...'
            />
          </Col>
        </Row>
        <Row>
          {selectiveAccess ? (
            <Col lg='2' xs='3' className='mb-1 pt_7 text-center'>
              <FormGroup inline>
                {isSelect ? (
                  <Input
                    type='checkbox'
                    id='basic-cb-checked'
                    className='cursor-pointer'
                    checked
                    onClick={() => setIsSelect(!isSelect)}
                  />
                ) : (
                  <Input
                    type='checkbox'
                    id='basic-cb-checked'
                    className='cursor-pointer'
                    onClick={() => setIsSelect(!isSelect)}
                  />
                )}
                <Label for='basic-cb-checked' className='font-weight-bold cursor-pointer'>
                  Selective access
                </Label>
              </FormGroup>
            </Col>
          ) : (
            ""
          )}
        </Row>
        {/* {inputType ? <Row className='border w-100 mb-2'></Row> : ''} */}
        <Row>
          {inputType ? (
            inputType.includes("date") || inputType.includes("time") ? (
              inputType === "timeRange" || inputType === "dateTimeRange" ? (
                <>
                  <Col lg='5' xs='6' className='mb-1'>
                    <Flatpickr
                      id='timeFrom'
                      className='form-control zindex_99'
                      onClose={(value) => timeChangeHandler(value)}
                      placeholder='Select from range ...'
                      options={{
                        ...params,
                        maxDate: moment().subtract(1, "day").endOf("day").toDate()
                      }}
                    />
                  </Col>
                  <Col lg='5' xs='6' className='mb-1'>
                    <Flatpickr
                      id='timeTo'
                      className='form-control zindex_99'
                      onClose={setToTime}
                      placeholder='Select to range ...'
                      options={{
                        ...params,
                        ...extraParams,
                        maxDate: moment().endOf("day").toDate()
                      }}
                    />
                  </Col>
                </>
              ) : (
                <Col lg='5' xs='6' className='mb-1'>
                  <Flatpickr
                    id='datePicker'
                    className='form-control zindex_99'
                    onClose={setDatePicker}
                    placeholder='Select date ...'
                    options={params}
                  />
                </Col>
              )
            ) : inputType === "range" ? (
              <Col lg='5' xs='6' className='mb-1 pl-2'>
                <Nouislider
                  className='mt-2'
                  start={rangePicker}
                  connect={true}
                  step={1}
                  tooltips={true}
                  direction='ltr'
                  range={params}
                  onChange={setRangePicker}
                />
              </Col>
            ) : inputType === "text" || inputType === "number" ? (
              <Col lg='5' xs='6' className='mb-1'>
                <Input
                  id='textInput'
                  type={inputType}
                  value={valuePicker}
                  onChange={fromNumberChangeHandler}
                  placeholder='Insert the value.'
                  {...params}
                />
              </Col>
            ) : inputType === "numberRange" ? (
              <>
                <Col lg='5' xs='6' className='mb-1'>
                  <Input
                    id='numberFrom'
                    type='number'
                    value={valuePicker}
                    onChange={fromNumberChangeHandler}
                    placeholder='insert from value.'
                    {...params}
                  />
                </Col>
                <Col lg='5' xs='6' className='mb-1'>
                  <Input
                    id='numberTo'
                    type='number'
                    value={toValue}
                    onChange={toNumberChangeHandler}
                    placeholder='insert to value.'
                    {...params}
                  />
                </Col>
              </>
            ) : inputType === "activityCal1ph" ? (
              <>
                <Col lg='3' xs='3' className='mb-1'>
                  <Flatpickr
                    id='timeFrom'
                    className='form-control zindex_99'
                    onClose={setActiveCal1}
                    placeholder='Select tod 1 ...'
                    options={params}
                  />
                </Col>
                <Col lg='3' xs='3' className='mb-1'>
                  <Flatpickr
                    id='timeTo'
                    className='form-control zindex_99'
                    onClose={setActiveCal2}
                    placeholder='Select tod 2 ...'
                    options={params}
                  />
                </Col>
                <Col lg='3' xs='3' className='mb-1'>
                  <Flatpickr
                    id='timeTo'
                    className='form-control zindex_99'
                    onClose={setActiveCal3}
                    placeholder='Select tod 3 ...'
                    options={params}
                  />
                </Col>
                <Col lg='3' xs='3' className='mb-1'>
                  <Flatpickr
                    id='timeTo'
                    className='form-control zindex_99'
                    onClose={setActiveCal4}
                    placeholder='Select tod 4 ...'
                    options={params}
                  />
                </Col>
              </>
            ) : inputType === "activityCal3ph" ? (
              <>
                <Col lg='2' xs='3' className='mb-1'>
                  <Flatpickr
                    id='timeFrom'
                    className='form-control zindex_99'
                    onClose={setActiveCal1}
                    placeholder='Select tod 1 ...'
                    options={params}
                  />
                </Col>
                <Col lg='2' xs='3' className='mb-1'>
                  <Flatpickr
                    id='timeTo'
                    className='form-control zindex_99'
                    onClose={setActiveCal2}
                    placeholder='Select tod 2 ...'
                    options={params}
                  />
                </Col>
                <Col lg='2' xs='3' className='mb-1'>
                  <Flatpickr
                    id='timeTo'
                    className='form-control zindex_99'
                    onClose={setActiveCal3}
                    placeholder='Select tod 3 ...'
                    options={params}
                  />
                </Col>
                <Col lg='2' xs='3' className='mb-1'>
                  <Flatpickr
                    id='timeTo'
                    className='form-control zindex_99'
                    onClose={setActiveCal4}
                    placeholder='Select tod 4 ...'
                    options={params}
                  />
                </Col>
                <Col lg='2' xs='3' className='mb-1'>
                  <Flatpickr
                    id='timeTo'
                    className='form-control zindex_99'
                    onClose={setActiveCal5}
                    placeholder='Select tod 5 ...'
                    options={params}
                  />
                </Col>
                <Col lg='2' xs='3' className='mb-1'>
                  <Flatpickr
                    id='timeTo'
                    className='form-control zindex_99'
                    onClose={setActiveCal6}
                    placeholder='Select tod 6 ...'
                    options={params}
                  />
                </Col>
                <Col lg='2' xs='3' className='mb-1'>
                  <Flatpickr
                    id='timeTo'
                    className='form-control zindex_99'
                    onClose={setActiveCal7}
                    placeholder='Select tod 7 ...'
                    options={params}
                  />
                </Col>
                <Col lg='2' xs='3' className='mb-1'>
                  <Flatpickr
                    id='timeTo'
                    className='form-control zindex_99'
                    onClose={setActiveCal8}
                    placeholder='Select tod 8 ...'
                    options={params}
                  />
                </Col>
              </>
            ) : inputType === "select_text" || inputType === "select_number" ? (
              <Col lg='5' md='6' xs='12' className='mb-1'>
                <Select
                  isClearable={true}
                  theme={selectThemeColors}
                  closeMenuOnSelect={!params.isMulti}
                  onChange={setSelectedESW}
                  options={params.options}
                  value={selectedESW}
                  isMulti={params.isMulti}
                  className='react-select zindex_100'
                  classNamePrefix='select'
                  placeholder={params.placeholder}
                />
              </Col>
            ) : (
              ""
            )
          ) : (
            ""
          )}
        </Row>

        <CardFooter className='border-top-0 pt-1 p-0'>
          <div className='d-flex justify-content-between '>
            {/* Previous button*/}
            <Button.Ripple
              color='primary'
              className='btn-prev '
              id='preMeterButton'
              outline
              onClick={() => props.stepper.previous()}
            >
              <ArrowLeft size={14} className='align-middle mr-sm-25 mr-0'></ArrowLeft>
              <span className='align-middle d-sm-inline-block d-none'>Previous</span>
            </Button.Ripple>

            {/* Apply button */}

            <Button.Ripple
              onClick={submitCommmandRequest}
              disabled={loader}
              type='submit'
              color='primary'
            >
              <span className='align-middle px-2'>Apply </span>
            </Button.Ripple>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}

export default MeterCommand
