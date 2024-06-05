import React, { useState, useEffect } from "react"
import { Card, CardFooter, Col, Row, Button, Input, Label } from "reactstrap"
import Select from "react-select"
import { selectThemeColors } from "@utils"
import { ArrowLeft } from "react-feather"
import { toast } from "react-toastify"
import Toast from "@src/views/ui-elements/cards/actions/createToast"
import useJwt from "@src/auth/jwt/useJwt"
import authLogout from "../../../../../../../auth/jwt/logoutlogic"
import { useDispatch } from "react-redux"
import { useHistory, useLocation } from "react-router-dom"
import Flatpickr from "react-flatpickr"
import moment from "moment"

const MeterCommand = (props) => {
  const { selectedMeterOptions, setSelectedMeterOptions } = props
  // console.log(selectedMeterOptions.value)

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

  const [params, setParams] = useState({})
  // console.log(params)
  const [extraParams, setExtraParams] = useState({})
  const [selectedCommand, setSelectedCommand] = useState()

  const [inputType, setInputType] = useState("")
  const [datePicker, setDatePicker] = useState()
  const [valuePicker, setValuePicker] = useState(inputType === "multi_fields" ? [] : "")
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
  const [selectiveAccess, setSelectiveAccess] = useState()
  const [isSelect, setIsSelect] = useState(true)
  const [selectedESW, setSelectedESW] = useState()
  const [fetchingData, setFetchingData] = useState(true)
  const [commandList, setCommandList] = useState([])
  const [clockValue, setClockValue] = useState()

  // to get projectname
  const projectName = location.pathname.split("/")[2]

  // command select dropdown custom styles
  const customStyles = {
    control: (provided) => ({
      ...provided,
      border: "1px solid #7367f0"
      // Add any custom syytyles for the control wrapper here
    })
  }

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

  // To execute command
  const postCommandExecutionRequest = async (jsonBody) => {
    return await useJwt
      .postGasMeterCommandExecution(jsonBody)
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
    if (fetchingData) {
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
    }
  }, [fetchingData])

  // on Change on select command
  const handleSelectCommand = (e) => {
    if (e) {
      setSelectedCommand(e)
    } else {
      setSelectedCommand({})
    }
  }

  const resetDefault = () => {
    setDatePicker()
    setRangePicker([0, 0])
    setValuePicker(inputType === "multi_fields" ? [] : "")
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
    setClockValue()
    setSelectiveAccess(false)
  }

  const isFormValid = () => {
    // Check if any field is empty or not in range
    return valuePicker.every((value, index) => {
      const { min, max } = params[index].params
      return (
        value.trim() !== "" && // Check if value is not empty
        !isNaN(value) &&
        parseInt(value) >= min &&
        parseInt(value) <= max
      ) // Check if value is in range if it's a number
    })
  }
  //  on click function of apply button to submit command
  const submitCommmandRequest = async (event) => {
    // Validation procedure

    // event.currentTarget.disabled = true
    // console.log('button clicked')
    if (!selectedCommand?.value) {
      toast.error(<Toast msg='Please select command.' type='danger' />, {
        hideProgressBar: true
      })
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
          } else {
            if (!datePicker || !toTime) {
              toast.error(<Toast msg='Please select Time range.' type='danger' />, {
                hideProgressBar: true
              })
              return false
            }
          }
        } else if (!datePicker) {
          toast.error(<Toast msg='Please select Date.' type='danger' />, {
            hideProgressBar: true
          })
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
      } else if (inputType === "text" || inputType === "number") {
        if (parseInt(valuePicker) < params.min || parseInt(valuePicker) > params.max) {
          toast.error(
            <Toast
              msg={`Please insert the value in range between  ${params.min} to ${params.max}.`}
              type='danger'
            />,
            {
              hideProgressBar: true
            }
          )
          return false
        }
        if (selectedCommand["value"] === "RECHARGE") {
          if (valuePicker === "" || valuePicker === 0) {
            toast.error(<Toast msg='Please insert input value.' type='danger' />, {
              hideProgressBar: true
            })
            return false
          }
        } else if (selectedCommand["value"] === "SET_EMERGENCY_LIMIT") {
          if (valuePicker === "" || valuePicker === 1 || valuePicker > 0 || valuePicker < -5000) {
            toast.error(<Toast msg='Please insert input value.' type='danger' />, {
              hideProgressBar: true
            })
            return false
          }
        } else if (!valuePicker) {
          // console.log('hello')
          toast.error(<Toast msg='Please insert input value.' type='danger' />, {
            hideProgressBar: true
          })
          return false
        }
      } else if (inputType === "multi_fields") {
        const isFormValid = []

        let placeholder = ""
        for (let index = 0; index < params.length; index++) {
          const value = valuePicker[index]
          if (value !== "" && value !== undefined) {
            const { min, max } = params[index].params
            if (parseInt(value) < min || parseInt(value) > max) {
              isFormValid[index] = false
            } else {
              isFormValid[index] = true
            }
          } else {
            isFormValid[index] = false
            placeholder = params[0].placeholder
          }
        }

        if (
          isFormValid.includes(false) &&
          valuePicker.length !== 0 &&
          valuePicker.length === params.length &&
          !valuePicker.includes("")
        ) {
          params.forEach((param, index) => {
            if (!isFormValid[index]) {
              const { min, max } = param.params
              toast.error(
                <Toast
                  msg={`Please insert the value in ${param.placeholder} in range between ${min} to ${max}.`}
                  type='danger'
                />,
                {
                  hideProgressBar: true
                }
              )
            }
          })
          return
        }

        if (!valuePicker || valuePicker.includes("") || valuePicker.length !== params.length) {
          for (let index = 0; index < params.length; index++) {
            if (valuePicker[index] === "" || valuePicker[index] === undefined) {
              const placeholder = params[index].placeholder
              toast.error(<Toast msg={`Please insert ${placeholder} value.`} type='danger' />, {
                hideProgressBar: true
              })
              return
            }
          }
        }
      } else if (inputType === "numberRange" && (!valuePicker || !toValue)) {
        toast.error(<Toast msg='Please insert number range.' type='danger' />, {
          hideProgressBar: true
        })
        return false
      } else if (inputType === "set_clock" && !clockValue) {
        toast.error(<Toast msg={"Please Set Time."} type='danger' />, {
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
        toast.error(<Toast msg={`${params.placeholder}`} type='danger' />, {
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
            moment(datePicker[0]).format("HH:00:00"),
            moment(toTime[0]).format("HH:00:00")
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
            val = {
              from: parseInt(rangePicker[0]),
              to: parseInt(rangePicker[1])
            }
            mod = "range"
            inpt = "number"
          }
        } else if (rangePicker) {
          val = {
            from: parseInt(rangePicker[0]),
            to: parseInt(rangePicker[1])
          }
          mod = "range"
          inpt = "number"
        }
      } else if (inputType === "text" || inputType === "number") {
        val = valuePicker
        mod = params.mode ? params.mode : ""
        inpt = inputType
      } else if (inputType === "multi_fields") {
        val = valuePicker
        mod = params.mode ? params.mode : ""
        inpt = inputType
      } else if (inputType === "numberRange") {
        val = { from: parseInt(valuePicker), to: parseInt(toValue) }
        mod = "range"
        inpt = "number"
      } else if (inputType === "set_clock") {
        const formatedClockTime = moment(clockValue[0]).format("HH:mm:ss")
        val = formatedClockTime
        mod = ""
        inpt = "date"
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

    // Create the payload and payload for post request
    for (const i of selectedMeterOptions) {
      selectedMetersList.push({
        name: "meter",
        meter_serial: i.value,
        value: {
          meter_serial: i.value,
          project: projectName
        },
        command: commandName,
        args: {
          value: val,
          input_type: inpt,
          mode: mod
        }
      })
    }

    const [statusCode, response] = await postCommandExecutionRequest({
      data: selectedMetersList
    })
    if (statusCode && statusCode === 201) {
      // Back to wizard first tab
      document.getElementById("preMeterButton").click()
      resetDefault()
      setSelectedCommand({})
      props.reloadCommandHistory()
      props.toggleCommandExecutionModal()
      toast.success(<Toast msg='Command sent to meter successfully.' type='success' />, {
        hideProgressBar: true
      })
    } else if (statusCode === 401 || statusCode === 403) {
      setLogout(true)
    } else {
      if (typeof response === "string") {
        toast.error(<Toast msg={response} type='danger' />, {
          hideProgressBar: true
        })
      } else {
        toast.error(<Toast msg='Command sent to meter failed.' type='danger' />, {
          hideProgressBar: true
        })
      }
    }
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
        setIsSelect(false)
        setSelectiveAccess(false)
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

  const blockInvalidChar = (e) => {
    if (parseInt(params.min) < 0) {
      return ["e", "E", "+"].includes(e.key) && e.preventDefault()
    } else {
      return ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
    }
  }

  const fromNumberChangeHandler = async (event, index) => {
    try {
      if (inputType.includes("multi_fields")) {
        setValuePicker((prevState) => {
          const updatedValues = [...prevState]
          const { value, max } = event.target
          if (parseInt(value) > max) {
            updatedValues[index] = max // Set the value to the maximum if it exceeds the limit
          } else {
            updatedValues[index] = value.replace(/^0+(?=\d)/, "")
          }
          // console.log(updatedValues)
          return updatedValues
        })
      } else if (inputType.includes("number")) {
        const { value, min, max } = event.target
        if (value === "") {
          setValuePicker(null)
        } else {
          if (selectedCommand?.value === "RECHARGE") {
            // Handle the special case for RECHARGE command
            if (parseInt(value) > max) {
              setValuePicker(max)
            } else {
              const modifiedValue =
                value.indexOf(".") >= 0 ? value.slice(0, value.indexOf(".") + 3) : value
              setValuePicker(modifiedValue.replace(/^0+(?=\d)/, ""))
            }
          } else {
            if (parseInt(value) > max) {
              setValuePicker(max)
            } else {
              // const val = Math.max(Number(min), Math.min(Number(max), Number(value)))
              setValuePicker(value.replace(/^0+(?=\d)/, ""))
            }
          }
        }
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

  return (
    <>
      <Card>
        <Row>
          <Col lg='5' md='6' xs='12' className='mb-1'>
            {/* command Selection */}
            <label id='meter' style={{ fontWeight: "550", fontSize: "15px" }}>
              Select Command
            </label>
            <Select
              id='meter'
              theme={selectThemeColors}
              className='react-select '
              classNamePrefix='select'
              styles={customStyles}
              options={commandList}
              value={selectedCommand}
              onChange={handleSelectCommand}
              isClearable={true}
              placeholder='Select Command....'
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
                      options={params}
                    />
                  </Col>
                  <Col lg='5' xs='6' className='mb-1'>
                    <Flatpickr
                      id='timeTo'
                      className='form-control zindex_99'
                      onClose={setToTime}
                      placeholder='Select to range ...'
                      options={params}
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
                  onKeyDown={(e) => {
                    if (inputType === "number") {
                      blockInvalidChar(e)
                    }
                  }}
                  {...params}
                />
              </Col>
            ) : inputType === "multi_fields" ? (
              params &&
              params.map((input, index) => {
                // Added index parameter for uniqueness
                if (input.input_type === "number" || input.input_type === "text") {
                  return (
                    <Col lg='5' xs='6' className='mb-1' key={index}>
                      <Input
                        id={`textInput_${index}`} // Unique ID for each input field
                        type={input.input_type}
                        value={valuePicker[index] || ""} // Use valuePicker[index] for each input
                        onChange={(e) => fromNumberChangeHandler(e, index)} // Pass index to handler
                        placeholder={input.placeholder}
                        onKeyDown={(e) => {
                          if (input.input_type === "number") {
                            blockInvalidChar(e)
                          }
                        }}
                        {...input.params}
                      />
                    </Col>
                  )
                }
              })
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
            ) : inputType === "set_clock" ? (
              <>
                <Col lg='5' xs='3' className='mb-1'>
                  <Flatpickr
                    id='setClockValue'
                    className='form-control zindex_99'
                    onClose={setClockValue}
                    placeholder='Set Wakeup Time..'
                    options={params}
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
              onClick={() => {
                props.stepper.previous()
              }}
            >
              <ArrowLeft size={14} className='align-middle mr-sm-25 mr-0'></ArrowLeft>
              <span className='align-middle d-sm-inline-block d-none'>Previous</span>
            </Button.Ripple>

            {/* apply button */}
            <Button.Ripple
              type='submit'
              color='primary'
              onClick={() => {
                // console.log('hello')
                submitCommmandRequest()
              }}
            >
              <span className='align-middle px-2'>Apply</span>
            </Button.Ripple>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}

export default MeterCommand
