import { Button, Col, Row, Form, FormGroup, Label, Input, CustomInput } from "reactstrap"
import Select from "react-select"
import { useSelector, useDispatch, batch } from "react-redux"
import { useEffect, useState } from "react"
import { handleMDASCommandHistoryWithFilter } from "@store/actions/UtilityProject/MDAS/commandHistoryWithFilter"

const FilterForm = (props) => {
  // console.log('Filter Applied')
  // console.log(props.filterAppliedParams)

  const [assetUnSelectedOnPurpose, setAssetUnSelectedOnPurpose] = useState(false)
  const [commandNameUnSelectedOnPurpose, setCommandNameUnSelectedOnPurpose] = useState(false)
  const [commandStatusUnSelectedOnPurpose, setCommandStatusUnSelectedOnPurpose] = useState(false)
  const [supplyTypeUnSelectedOnPurpose, setSupplyTypeUnSelectedOnPurpose] = useState(false)

  // Store to access DTR List
  const responseData = useSelector((state) => state.UtilityMDASAssetListReducer)

  // DLMS and TAP Command List
  const responseDLSMCommandList = useSelector((state) => state.UtilityMDASDlmsCommandReducer)
  const repsonseTAPCommandList = useSelector((state) => state.UtilityMDASTapCommandReducer)

  // console.log('DLMS Command List ....')
  // console.log(responseDLSMCommandList.responseData)

  // PSS,DTR and Feeder Asset List
  const responseAssetList = useSelector((state) => state.UtilityMDASAssetListReducer.responseData)

  // Toggle to display search meter serial number or dtr selection drop down
  const [toggleSearch, setToggleSearch] = useState(null)

  if (props.filterAppliedParams && "asset_type" in props.filterAppliedParams) {
    if (toggleSearch === null && !assetUnSelectedOnPurpose) {
      if (props.filterAppliedParams.asset_type === "dtr") {
        setToggleSearch(false)
      } else if (props.filterAppliedParams.asset_type === "meter") {
        setToggleSearch(true)
      }
    }
  }

  // Asset Type Selected
  const [selected, setSelected] = useState(false)
  // const [props.selectedAssetType, setSelectedAssetType] = useState('dtr')

  // console.log(props.selectedAssetType)
  if (props.filterAppliedParams && "asset_type" in props.filterAppliedParams && selected) {
    // console.log(props.filterAppliedParams)
    if (props.filterAppliedParams.asset_type !== props.selectedAssetType) {
      props.setSelectedAssetType(props.filterAppliedParams.asset_type)
      // setSelected(!selected)
    }
  }

  // console.log("Selected Asset Type ............")
  // console.log(props.selectedAssetType)

  // Selected Asset Item List
  const [selectedAssetNameList, setSelectedAssetNameList] = useState([])
  // console.log(props.filterAppliedParams)
  // Asset Name
  const [assetName, setAssetName] = useState(null)
  if (props.filterAppliedParams && "asset_type" in props.filterAppliedParams) {
    if (assetName === null && !assetUnSelectedOnPurpose) {
      if ("site_id" in props.filterAppliedParams) {
        setAssetName(props.filterAppliedParams.site_id)
        // setCheck(props.filterAppliedParams.site_id )
      } else if ("meter" in props.filterAppliedParams) {
        setAssetName(props.filterAppliedParams.meter)
      }
    }

    // setSelectedAssetType(props.filterAppliedParams.asset_type)
  }

  // Local State management for filter parameter selection
  // const [protocol, setProtocol] = useState(undefined)
  // setProtocol(props.protocol)

  // Command Selected
  const [selectedCommandName, setSelectedCommandName] = useState(null)
  if (props.filterAppliedParams && "command" in props.filterAppliedParams) {
    if (selectedCommandName === null && !commandNameUnSelectedOnPurpose) {
      setSelectedCommandName(props.filterAppliedParams.command)
    }
  }

  // console.log('Selected Command Name ....')
  // console.log(selectedCommandName)

  // Local State Management for command status selected
  const [commandStatus, setCommandStatus] = useState(null)
  if (props.filterAppliedParams && "execution_status" in props.filterAppliedParams) {
    if (commandStatus === null && !commandStatusUnSelectedOnPurpose) {
      setCommandStatus(props.filterAppliedParams.execution_status)
    }
  }

  // Local State Management for Supply Type Selection
  const [supplyType, setSupplyType] = useState(null)
  if (props.filterAppliedParams && "meter_type" in props.filterAppliedParams) {
    if (supplyType === null && !supplyTypeUnSelectedOnPurpose) {
      setSupplyType(props.filterAppliedParams.meter_type)
    }
  }

  // Local State Management for Communication Protocol
  const [communicationProtocol, setCommunicationProtocol] = useState(undefined)

  // populate based on protocol selected
  const [commandList, setCommandList] = useState([])

  // populated based on protocol selected
  const [commandExecutionStatusList, setCommandExecutionStatusList] = useState([])

  // Command Status DLMS
  const execution_status_dlms = [
    {
      value: "INITIATE",
      label: "INITIATE"
    },
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
      value: "FAILED",
      label: "FAILED"
    }
  ]

  // Command Status for TAP
  const execution_status_tap = [
    {
      value: "EXECUTED",
      label: "EXECUTED"
    },
    {
      value: "TIMEOUT",
      label: "TIMEOUT"
    },
    {
      value: "PROCESSING",
      label: "PROCESSING"
    }
  ]

  // Meter Type
  const meter_type = [
    { value: "1-Ph", label: "1-Ph" },
    { value: "3-Ph", label: "3-Ph" }
  ]

  // Communication Protocol
  const communication_protocol = [
    {
      value: "MQTT",
      label: "MQTT"
    },
    {
      value: "TCP",
      label: "TCP"
    }
  ]

  // Fetch All PSS List
  let pss_list = []
  if (responseAssetList) {
    pss_list = responseAssetList.pss_list
  }

  // Fetch All Feeder List
  let feeder_list = []
  if (responseAssetList) {
    feeder_list = responseAssetList.feeder_list
  }

  // Fetch All DTR List
  // let dtr_list = []
  // if (responseAssetList) {
  //   dtr_list = responseAssetList.dtr_list
  // }

  // Updated Code to fetch and inflate dtr list
  let dtr_list = []
  if (responseData) {
    dtr_list = responseData.responseData.dtr_list
  }

  // Asset Name Selected
  const assetNameSelected = (selection) => {
    // console.log('Asset Selected Name ....')
    // console.log(selection)

    if (selection) {
      setAssetName(selection["value"])
    } else {
      setAssetName(null)
      setAssetUnSelectedOnPurpose(true)
      // props.AppliedFilterparams(undefined, true)
    }
  }

  // populate Asset List based on asset type selected
  useEffect(() => {
    const asset_list = []
    if (props.selectedAssetType === "pss") {
      for (const asset of pss_list) {
        const temp = {}
        temp["value"] = asset["pss_id"]
        temp["label"] = asset["pss_name"]
        temp["isFixed"] = "true"
        asset_list.push(temp)
      }
      setSelectedAssetNameList(asset_list)
    } else if (props.selectedAssetType === "feeder") {
      for (const asset of feeder_list) {
        const temp = {}
        temp["value"] = asset["feeder_id"]
        temp["label"] = asset["feeder_name"]
        temp["isFixed"] = "true"
        asset_list.push(temp)
      }
      setSelectedAssetNameList(asset_list)
    } else if (props.selectedAssetType === "dtr") {
      for (const asset of dtr_list) {
        const temp = {}
        // temp['value'] = asset['dtr_id']
        // temp['label'] = asset['dtr_name']

        // Updated Code
        temp["value"] = asset["dtr_id"]
        temp["label"] = asset["dtr_name"]

        temp["isFixed"] = "true"
        asset_list.push(temp)
      }
      setSelectedAssetNameList(asset_list)
    }
  }, [props.selectedAssetType])

  // populate command list based on protocol Selected
  useEffect(() => {
    if (props.protocol) {
      if (props.protocol === "dlms") {
        if (responseDLSMCommandList.responseData) {
          if (responseDLSMCommandList.responseData.length > 0) {
            setCommandList(responseDLSMCommandList.responseData)
            setCommandExecutionStatusList(execution_status_dlms)
          }
        }
      } else if (props.protocol === "tap") {
        if (repsonseTAPCommandList.responseData) {
          if (repsonseTAPCommandList.responseData.length > 0) {
            setCommandList(repsonseTAPCommandList.responseData)
            setCommandExecutionStatusList(execution_status_tap)
          }
        }
      }
    } else {
      setCommandList([])
      setCommandExecutionStatusList([])
    }
  }, [props.protocol])

  // Command Selected
  const commandSelected = (selection) => {
    // console.log('Command Selected ....')
    // console.log()

    if (selection) {
      setSelectedCommandName(selection["value"])
    } else {
      setCommandNameUnSelectedOnPurpose(true)
      setSelectedCommandName(null)
      setCommandStatus(null)
      setSupplyType(null)
      setAssetName(null)
    }
  }

  // Command Status Selected
  const commandStatusSelected = (selection) => {
    if (selection) {
      setCommandStatus(selection["value"])
    } else {
      setCommandStatusUnSelectedOnPurpose(true)
      setCommandStatus(null)
      setSupplyType(null)
      setAssetName(null)
    }
  }

  // Supply Type Selected
  const supplyTypeSelected = (selection) => {
    if (selection) {
      setSupplyType(selection["value"])
    } else {
      setSupplyTypeUnSelectedOnPurpose(true)
      setSupplyType(null)
    }
  }

  // Communication Protocol Selected
  const communicationProtocolSelected = (selection) => {
    if (selection) {
      setCommunicationProtocol(selection["value"])
    } else {
      setAssetUnSelectedOnPurpose(true)
      setCommunicationProtocol(undefined)
    }
  }

  const handleChange = (event) => {
    if (event.target.value) {
      setAssetName(event.target.value)
    } else {
      setAssetName(null)
    }
  }

  // On Filter Apply Button clicked
  const onApplyButtonClicked = () => {
    props.handleFilter()

    const params = {}

    // console.log('Selected Asset Type ....')
    // console.log(props.selectedAssetType)

    // console.log('Asset Name')
    // console.log(assetName)

    if (props.selectedAssetType) {
      if (props.selectedAssetType === "pss") {
        if (assetName) {
          params["pss_id"] = assetName
          params["asset_type"] = "pss"
        }
      } else if (props.selectedAssetType === "feeder") {
        if (assetName) {
          params["feeder_id"] = assetName
          params["asset_type"] = "feeder"
        }
      } else if (props.selectedAssetType === "dtr") {
        if (assetName) {
          params["site_id"] = assetName
          params["asset_type"] = "dtr"
        }
      } else if (props.selectedAssetType === "meter") {
        if (assetName) {
          params["meter"] = assetName
          params["asset_type"] = "meter"
        }
      }
    }

    if (selectedCommandName) {
      params["command"] = selectedCommandName
    }

    if (commandStatus) {
      params["execution_status"] = commandStatus
    }

    if (supplyType) {
      params["meter_type"] = supplyType
    }

    if (communicationProtocol) {
      params["communication_protocol"] = communicationProtocol
    }

    if (!Object.values(params).some((v) => v)) {
      // Since No Filter params selected reset command History
      props.AppliedFilterparams(undefined, true)
    } else {
      props.AppliedFilterparams(params, false)
    }
  }

  const onResetButtonClicked = () => {
    props.handleFilter()
    props.AppliedFilterparams(undefined, true)
  }

  // Dummy variable for commAND STATUS

  // Handl default value for command status
  const command_status = {}
  if (props.filterAppliedParams && "execution_status" in props.filterAppliedParams) {
    command_status["defaultValue"] = {
      value: props.filterAppliedParams.execution_status,
      label: props.filterAppliedParams.execution_status
    }
  }

  // Handle default value for site id
  const select_site_id = {}
  if (props.filterAppliedParams && "site_id" in props.filterAppliedParams) {
    select_site_id["defaultValue"] = {
      value: props.filterAppliedParams.site_id,
      label: props.filterAppliedParams.site_id
    }
  }

  // Handle default value for meter serial number
  const select_meter = {}
  if (props.filterAppliedParams && "meter" in props.filterAppliedParams) {
    select_meter["defaultValue"] = props.filterAppliedParams.meter
  }

  // Handle default value for command
  const select_command = {}
  if (props.filterAppliedParams && "command" in props.filterAppliedParams) {
    select_command["defaultValue"] = {
      value: props.filterAppliedParams.command,
      label: props.filterAppliedParams.command
    }
  }

  // Asset Type Selected
  const assetTypeSelected = (_toggleSearch, selection) => {
    if (selection) {
      setToggleSearch(_toggleSearch)
      props.setSelectedAssetType(selection)
      setAssetName("")
    } else {
      props.setSelectedAssetType("")
      // setSelected(true)
    }
  }

  // Handle default value for Supply Type/ Meter Type
  const select_meter_type = {}
  if (props.filterAppliedParams && "meter_type" in props.filterAppliedParams) {
    select_meter_type["defaultValue"] = {
      value: props.filterAppliedParams.meter_type,
      label: props.filterAppliedParams.meter_type
    }
  }

  return (
    <Row className='mb-1'>
      {/* Radio Button Group to select asset type */}
      <Col className='mb-2'>
        <div className='demo-inline-spacing'>
          {/* <FormGroup check inline className='mt-0'>
            <Label check onClick={() => assetTypeSelected(false, 'pss')}>
              <Input type='radio' name='asset_type' /> <span style={{ fontSize: '15px' }}>PSS</span>
            </Label>
          </FormGroup>
          <FormGroup check inline className='mt-0'>
            <Label check onClick={() => assetTypeSelected(false, 'feeder')}>
              <Input type='radio' name='asset_type' /> <span style={{ fontSize: '15px' }}>Feeder</span>
            </Label>
          </FormGroup> */}
          <FormGroup inline className='mt-0 ml-2'>
            <Label onClick={() => assetTypeSelected(false, "dtr")}>
              <Input type='radio' name='asset_type' checked={props.selectedAssetType === "dtr"} />{" "}
              <span style={{ fontSize: "15px" }}>DTR</span>
            </Label>
          </FormGroup>
          <FormGroup inline className='mt-0 ml-1'>
            <Label onClick={() => assetTypeSelected(true, "meter")}>
              <Input type='radio' name='asset_type' checked={props.selectedAssetType === "meter"} />{" "}
              <span style={{ fontSize: "15px" }}>Meter</span>
            </Label>
          </FormGroup>
        </div>
      </Col>

      {/* Asset Selection dropdown/Search based on asset selection */}
      {toggleSearch ? (
        <Col sm='12' className='mb-2'>
          <Input
            id='textInput'
            type='text'
            {...select_meter}
            onChange={handleChange}
            placeholder='Search meter serial/Consumer ID/Sc No ...'
          />
        </Col>
      ) : (
        <Col sm='12' className='mb-2'>
          <Select
            isClearable={true}
            {...select_site_id}
            closeMenuOnSelect={true}
            onChange={assetNameSelected}
            isSearchable
            options={selectedAssetNameList}
            className='react-select border-secondary rounded'
            classNamePrefix='select'
            placeholder='Select Asset ...'
          />
        </Col>
      )}

      {/* Select Command Name */}
      <Col sm='12' className='mb-2'>
        <Select
          isClearable={true}
          closeMenuOnSelect={true}
          onChange={commandSelected}
          {...select_command}
          isSearchable
          options={commandList}
          className='react-select border-secondary rounded'
          classNamePrefix='select'
          placeholder='Select command name ...'
        />
      </Col>

      {/* Select Command Status */}
      <Col sm='12' className='mb-2'>
        <Select
          isClearable={true}
          closeMenuOnSelect={true}
          isSearchable
          onChange={commandStatusSelected}
          {...command_status}
          options={commandExecutionStatusList}
          className='react-select border-secondary rounded'
          classNamePrefix='select'
          placeholder='Select command status ...'
        />
      </Col>

      {/* Select Meter Type */}
      {/* <Col sm='12' className='mb-2'>
        <Select
          isClearable={true}
          closeMenuOnSelect={true}
          isSearchable
          onChange={supplyTypeSelected}
          options={meter_type}
          {...select_meter_type}
          className='react-select border-secondary rounded'
          classNamePrefix='select'
          placeholder='Select Meter Type ...'
        />
      </Col> */}

      {/* Select Communication protocol */}
      {/* <Col sm='12' className='mb-2'>
        <Select
          isClearable={true}
          closeMenuOnSelect={true}
          isSearchable
          onChange={communicationProtocolSelected}
          options={communication_protocol}
          className='react-select border-secondary rounded'
          classNamePrefix='select'
          placeholder='Select Communication Protocol ...'
        />
      </Col> */}

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
  )
}

export default FilterForm
