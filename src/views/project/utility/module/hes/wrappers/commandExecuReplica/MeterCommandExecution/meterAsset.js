import React, { useState, useEffect } from 'react'
import { ArrowRight, Search, Trash2 } from 'react-feather'
import { Col, Button, Row, InputGroup, Input, InputGroupAddon, Form, Spinner } from 'reactstrap'

import useJwt from '@src/auth/jwt/useJwt'

import { useDispatch, useSelector, batch } from 'react-redux'

import { useLocation, useHistory } from 'react-router-dom'

import { handleMDMSHierarchyProgress } from '@store/actions/UtilityProject/MDMS/HierarchyProgress'

import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
// import { useHistory } from 'react-router-dom'
import authLogout from '../../../../../../../../auth/jwt/logoutlogic'

import { caseInsensitiveSort } from '@src/views/utils.js'

import {
  handleEnergyConsumptionData,
  handleAlertsData,
  handleOpertationalStatisticsData,
  handleUptimeData,
  handleBillsGeneratedData,
  handleSLAInformationData
} from '@store/actions/UtilityProject/MDMS/user'

import {
  handleEnergyConsumptionData as handleEnergyConsumptionDatadtr,
  handleAlertsData as handleAlertsDatadtr,
  handleOpertationalStatisticsData as handleOpertationalStatisticsDatadtr,
  handleUptimeData as handleUptimeDatadtr,
  handleBillsGeneratedData as handleBillsGeneratedDatadtr
} from '@store/actions/UtilityProject/MDMS/dtr'

import {
  handleEnergyConsumptionData as handleEnergyConsumptionDatafeeder,
  handleAlertsData as handleAlertsDatafeeder,
  handleOpertationalStatisticsData as handleOpertationalStatisticsDatafeeder,
  handleUptimeData as handleUptimeDatafeeder,
  handleBillsGeneratedData as handleBillsGeneratedDatafeeder
} from '@store/actions/UtilityProject/MDMS/feeder'

import {
  handleEnergyConsumptionData as handleEnergyConsumptionDatapss,
  handleAlertsData as handleAlertsDatapss,
  handleOpertationalStatisticsData as handleOpertationalStatisticsDatapss,
  handleUptimeData as handleUptimeDatapss,
  handleBillsGeneratedData as handleBillsGeneratedDatapss
} from '@store/actions/UtilityProject/MDMS/pss'

import {
  handleConsumerProfileInformationData,
  handleConsumerTotalConsumptionData,
  handleConsumerTotalRechargesData,
  handleConsumerTopAlertsData,
  handleConsumerTopMeterAlertsData,
  handleCommandInfoData
} from '@store/actions/UtilityProject/MDMS/userprofile'

import DataTable from '@src/views/ui-elements/dataTableUpdated'

const MeterAsset = props => {
  const meter_command_execution_allowed = 250
  const { tableData, setTableData, projectName } = props

  // console.log(tableData)

  const [loader, setLoader] = useState(false)
  const location = useLocation()
  const dispatch = useDispatch()
  const history = useHistory()

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const HierarchyProgress = useSelector(state => state.UtilityMDMSHierarchyProgressReducer.responseData)

  const [userInputParameter, setUserInputParameter] = useState('')

  const fetchData = async params => {
    return await useJwt
      .getProjectAsset(params)
      .then(res => {
        const status = res.status

        return [status, res]
      })
      .catch(err => {
        if (err.response) {
          const status = err.response.status
          return [status, err]
        } else {
          return [0, err]
        }
      })
  }

  const searchMeter = async () => {
    setLoader(true)
    const params = {
      project: projectName,
      unique_id: userInputParameter,
      asset_type: 'meter'
    }
    //Get searched Meter Info
    const [statusCode, responseInfo] = await fetchData(params)

    if (statusCode) {
      if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else {
        const meter_details = responseInfo.data.data.result.stat.asset

        if (meter_details.length > 0) {
          setTableData([...tableData, ...meter_details])
          setUserInputParameter('')
          setLoader(false)
          toast.success(<Toast msg={'Meter Found ....'} type='success' />, { hideProgressBar: true })

          batch(() => {
            dispatch(
              handleMDMSHierarchyProgress({
                project_type: location.pathname.split('/')[1],
                project_name: HierarchyProgress.project_name,
                module_name: 'mdms',
                pss_name: meter_details[0].pss_id,
                feeder_name: meter_details[0].feeder_id,
                dtr_name: meter_details[0].site_id,
                user_name: meter_details[0].sc_no,
                meter_serial_number: meter_details[0].meter_serial,
                mdms_state: 'user_profile',
                user_type: meter_details[0].connection_type,
                dtr_real_name: meter_details[0].site_name,
                feeder_real_name: meter_details[0].feeder_name,
                grid_id: meter_details[0].grid_id,
                meter_address: meter_details[0].meter_address,
                meter_protocol_type: meter_details[0].meter_protocol_type.toLowerCase(),
                pss_real_name: meter_details[0].pss_name,
                user_real_name: ''
              })
            )

            //Clear All User Data from redux store For DTR  level
            dispatch(handleEnergyConsumptionData([], true))
            dispatch(handleAlertsData([], true))
            dispatch(handleUptimeData([], true))
            dispatch(handleBillsGeneratedData([], true))
            dispatch(handleOpertationalStatisticsData([], true))

            //Clear All User profile Data from redux store
            dispatch(handleConsumerProfileInformationData([], true))
            dispatch(handleConsumerTotalConsumptionData([], true))
            dispatch(handleConsumerTotalRechargesData([], true))
            dispatch(handleConsumerTopAlertsData([], true))
            dispatch(handleConsumerTopMeterAlertsData([], true))
            dispatch(handleCommandInfoData([], true))

            //Clear All Feeder Level Data
            dispatch(handleEnergyConsumptionDatadtr([], true))
            dispatch(handleAlertsDatadtr([], true))
            dispatch(handleUptimeDatadtr([], true))
            dispatch(handleBillsGeneratedDatadtr([], true))
            dispatch(handleOpertationalStatisticsDatadtr([], true))

            // Clear All PSS Level Data
            dispatch(handleEnergyConsumptionDatafeeder([], true))
            dispatch(handleAlertsDatafeeder([], true))
            dispatch(handleUptimeDatafeeder([], true))
            dispatch(handleBillsGeneratedDatafeeder([], true))
            dispatch(handleOpertationalStatisticsDatafeeder([], true))

            // Clear All Project Level Data
            dispatch(handleEnergyConsumptionDatapss([], true))
            dispatch(handleAlertsDatapss([], true))
            dispatch(handleUptimeDatapss([], true))
            dispatch(handleBillsGeneratedDatapss([], true))
            dispatch(handleOpertationalStatisticsDatapss([], true))
          })
        } else {
          setLoader(false)
          setUserInputParameter('')
          toast.error(<Toast msg='No result found ....' type='danger' />, { hideProgressBar: true })
          return false
        }
      }
    }
  }

  // on serach function
  const onSubmit = () => {
    if (tableData.length < meter_command_execution_allowed) {
      if (tableData.length > 0) {
        let flag = false

        tableData.find(ele => {
          // if meter already exist in table
          if (ele.meter_serial === userInputParameter || ele.sc_no === userInputParameter) {
            flag = true
            return ele
          }
        })

        if (flag) {
          // console.log(flag)
          setUserInputParameter('')
          toast.warning(<Toast msg='Meter already exist in table ....' type='warning' />, { hideProgressBar: true })
          return false
        } else {
          // console.log(flag)
          searchMeter()
        }
      } else {
        searchMeter()
      }
    } else {
      toast.warning(<Toast msg={'Command Execution more than 30 meters are not allowed'} type='warning' />, { hideProgressBar: true })
      return false
    }
  }

  // on Input onChange function
  const userInputFun = event => {
    setUserInputParameter(event.target.value.trim())
  }

  // on Delete table row
  const onDelete = deletable => {
    const response = tableData.filter(i => i !== deletable)
    setTableData(response)
  }

  // table columns
  const tblColumn = () => {
    const column = []
    for (const i in tableData[0]) {
      const col_config = {}
      if (
        i !== 'house_id' &&
        i !== 'site_id' &&
        i !== 'supply_type' &&
        i !== 'name_bill' &&
        i !== 'latitude' &&
        i !== 'longitude' &&
        i !== 'pole_id' &&
        i !== 'meter_protocol_type' &&
        i !== 'feeder_id' &&
        i !== 'pss_id' &&
        i !== 'value' &&
        i !== 'label' &&
        i !== 'isFixed'
      ) {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
        col_config.serch = i
        col_config.sortable = true
        col_config.selector = row => row[i]
        col_config.width = '250px'
        col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)
        col_config.cell = row => {
          return (
            <div className='d-flex'>
              <span
                className='d-block font-weight-bold '
                title={row[i] ? (row[i] !== '' ? (row[i].toString().length > 20 ? row[i] : '') : '-') : '-'}>
                {row[i] && row[i] !== '' ? row[i].toString().substring(0, 20) : '-'}
                {row[i] && row[i] !== '' ? (row[i].toString().length > 20 ? '...' : '') : '-'}
              </span>
            </div>
          )
        }
        column.push(col_config)
      }
    }
    column.push({
      name: 'Action',
      width: '120px',
      cell: (row, index) => {
        return (
          <>
            <Trash2
              size='15'
              className=' ml-1 cursor-pointer'
              onClick={i => {
                onDelete(row)
              }}
            />
          </>
        )
      }
    })
    return column
  }

  return (
    <>
      <Row>
        <Col className='mb-1' lg='6' md='6'>
          <Form
            onSubmit={event => {
              event.preventDefault()
              if (userInputParameter.length === 0) {
                toast.warning(<Toast msg='Enter meter Serial No. /  SC No. ...' type='warning' />, { hideProgressBar: true })
                return false
              }
              onSubmit(event)
            }}>
            {!loader ? (
              <InputGroup>
                <Input
                  name={userInputParameter}
                  type='text'
                  value={userInputParameter}
                  onChange={userInputFun}
                  autoFocus={true}
                  placeholder='Enter meter Serial No. /  SC No. ...'
                />
                <InputGroupAddon addonType='append'>
                  <Button color='primary' outline type='submit'>
                    Search !
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            ) : (
              <>
                <InputGroup>
                  <Input
                    name={userInputParameter}
                    type='text'
                    value={userInputParameter}
                    onChange={userInputFun}
                    autoFocus={true}
                    placeholder='Search for meter Serial Number / Consumer ID / SC No. ...'
                    disabled
                  />
                  <InputGroupAddon addonType='append'>
                    <Button color='secondary' className='pt_9 mb-0' disabled>
                      <Spinner color='white' size='sm' className='mx_2 ' />
                      {/* <span className=' pt-2'>Loading...</span> */}
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
              </>
            )}
          </Form>
        </Col>
      </Row>

      <DataTable height={true} columns={tblColumn()} tblData={tableData} tableName={'Added  Meter '} donotShowDownload={true} rowCount={5} />

      {/* Next Button */}
      <div className='d-flex justify-content-end'>
        <Button.Ripple color='primary' outline className='mr-2' onClick={() => setTableData([])}>
          Reset
        </Button.Ripple>
        <Button.Ripple
          color='primary'
          className='btn-next'
          onClick={() => {
            if (tableData.length > 0) {
              props.stepper.next()
            } else {
              toast.warning(<Toast msg={' Please insert at least one data in table.'} type='warning' />, { hideProgressBar: true })
            }
          }}>
          <span className='align-middle d-sm-inline-block d-none'>Next</span>
          <ArrowRight size={14} className='align-middle ml-sm-25 ml-0'></ArrowRight>
        </Button.Ripple>
      </div>
    </>
  )
}

export default MeterAsset
