import React, { useState, useEffect } from "react"
import { ArrowRight } from "react-feather"
import { Button, Input, InputGroup, InputGroupAddon, Col, Row, Form, Label } from "reactstrap"
import GasMeteringSimpleTable from "../../../../../../ui-elements/gasMeteringTable/gasmeteringsimpletable"
import Select from "react-select"
import { selectThemeColors } from "@utils"
import { toast } from "react-toastify"
import Toast from "@src/views/ui-elements/cards/actions/createToast"
import useJwt from "@src/auth/jwt/useJwt"
import authLogout from "../../../../../../../auth/jwt/logoutlogic"
import { useDispatch } from "react-redux"
import { useHistory, useLocation } from "react-router-dom"
import { param } from "jquery"

const MeterAsset = (props) => {
  const { selectedMeterOptions, setSelectedMeterOptions, fetchingData, setFetchingData } = props
  // console.log(props)

  const [response, setResponse] = useState([])
  const [meterList, setMeterList] = useState([])

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
      let params = undefined
      params = {
        project: projectName === "ag&p-pratham" ? "agp-pratham" : projectName
      }

      const [statusCode, responseData] = await fetchData(params)
      if (statusCode === 200) {
        // Set response of meter list
        const res = responseData.data.data.result
        setResponse(res)

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
    }
  }, [fetchingData])

  // on meter handle change
  const handleSelectMeterChange = (selectedValues) => {
    setSelectedMeterOptions(selectedValues)
  }

  const onReset = () => {
    setSelectedMeterOptions([])
  }

  const customStyles = {
    control: (provided) => ({
      ...provided,
      border: "1px solid #7367f0"
      // Add any custom styles for the control wrapper here
    })
  }
  return (
    <>
      <Row>
        <Col className='mt-0' lg='7' md='6'>
          <Form>
            {/* select meter dropdown */}
            <Col className='mb-1'>
              <label style={{ fontWeight: "550", fontSize: "15px" }}>Select Meter</label>
              <Select
                id='meter'
                styles={customStyles}
                theme={selectThemeColors}
                className='react-select '
                classNamePrefix='select'
                options={meterList}
                onChange={handleSelectMeterChange}
                isClearable={false}
                placeholder={"Select ...."}
                closeMenuOnSelect={false}
                value={selectedMeterOptions}
                isMulti
              />
            </Col>
          </Form>
        </Col>
      </Row>

      {/* <GasMeteringSimpleTable
        columns={tblColumn(data)}
        tblData={data}
        tableName={'Added  Meter '}
        donotShowDownload={true}
        height={true}
        rowCount={5}
      /> */}

      {/* Next Button */}
      <div className='d-flex justify-content-end'>
        <Button.Ripple color='primary' outline className='mr-2' onClick={onReset}>
          Reset
        </Button.Ripple>
        <Button.Ripple
          color='primary'
          className='btn-next'
          onClick={() => {
            if (selectedMeterOptions.length > 0) {
              props.stepper.next()
            } else {
              toast.warning(<Toast msg={" Select at least one meter."} type='warning' />, {
                hideProgressBar: true
              })
            }
          }}
        >
          <span className='align-middle d-sm-inline-block d-none'>Next</span>
          <ArrowRight size={14} className='align-middle ml-sm-25 ml-0'></ArrowRight>
        </Button.Ripple>
      </div>
    </>
  )
}

export default MeterAsset
