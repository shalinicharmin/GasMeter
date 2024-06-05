import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSelector, useDispatch, batch } from 'react-redux'

import MdmsPssModule from '@src/views/project/utility/module/mdms/pss'
import MdmsFeederModule from '@src/views/project/utility/module/mdms/feeder'
import MdmsDtrModule from '@src/views/project/utility/module/mdms/dtr'
// import MdmsUserModule from '@src/views/project/utility/module/mdms/user'
// import MdmsUserConsumptionModule from '@src/views/project/utility/module/mdms/userProfile'
import Error from '@src/views/Error'

import { handleMDMSHierarchyProgress } from '@store/actions/UtilityProject/MDMS/HierarchyProgress'

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

import AllUsers from '@src/views/project/utility/module/mdms/users'
import MdmsUserConsumptionModule from '@src/views/project/utility/module/mdms/userProfile'

const MdmsUtility = props => {
  const [project_updated, set_project_updated] = useState(false)

  const dispatch = useDispatch()
  const responseData = useSelector(state => state.UtilityMDMSHierarchyProgressReducer.responseData)

  const location = useLocation()

  //Local state to manage selected user connection type
  const [connectionType, setConnectionType] = useState(undefined)

  //Local State to manage whether to show back button on User Component or not
  const [usersBackButton, setUserBackButton] = useState(true)

  const updateConnectionType = type => {
    setConnectionType(type)
  }

  let project = ''
  if (location.pathname.split('/')[2] === 'sbpdcl') {
    project = 'ipcl'
    // set_project_updated(true)
  } else {
    project = location.pathname.split('/')[2]
    // set_project_updated(true)
  }

  if (responseData.project_name) {
    if (responseData.project_name !== project && !project_updated) {
      set_project_updated(true)
    }
  }

  // if (project.length > 0) {
  //   if (location.pathname.split('/')[2] !== project) {
  //   }
  // }
  //Visited MDMS Module for first time dispatch Hierarch Progress
  useEffect(() => {
    if (!responseData.project_name) {
      dispatch(
        handleMDMSHierarchyProgress({
          project_type: location.pathname.split('/')[1],
          project_name: project,
          module_name: location.pathname.split('/')[3],
          pss_name: '',
          feeder_name: '',
          dtr_name: '',
          user_name: '',
          pss_real_name: '',
          feeder_real_name: '',
          dtr_real_name: '',
          user_real_name: '',
          mdms_state: 'pss'
        })
      )

      set_project_updated(false)
    } else if (responseData.project_name !== project || project_updated) {
      batch(() => {
        //Project changed in MDMS Module dispatch Hierarch progress and remove pss data from store
        dispatch(
          handleMDMSHierarchyProgress({
            project_type: location.pathname.split('/')[1],
            project_name: project,
            module_name: location.pathname.split('/')[3],
            pss_name: '',
            feeder_name: '',
            dtr_name: '',
            user_name: '',
            pss_real_name: '',
            feeder_real_name: '',
            dtr_real_name: '',
            user_real_name: '',
            mdms_state: 'pss'
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
      set_project_updated(false)
    }
  }, [project_updated])

  const [mdmsState, setMdmsState] = useState('pss')
  const mdmsStateHandler = state => {
    setMdmsState(state)
  }

  return responseData.mdms_state === 'pss' ? (
    <MdmsPssModule statehandler={mdmsStateHandler} />
  ) : responseData.mdms_state === 'feeder' ? (
    <MdmsFeederModule statehandler={mdmsStateHandler} />
  ) : responseData.mdms_state === 'dtr' ? (
    <MdmsDtrModule statehandler={mdmsStateHandler} />
  ) : responseData.mdms_state === 'user' ? (
    // <MdmsUserModule statehandler={mdmsStateHandler} showBackButton={props.showBackButton} />
    <AllUsers
      updateConnectionType={updateConnectionType}
      // id={props.dtr_list[0]['id']}
      txtLen={16}
      tableName={'All Users'}
      updateMdmsState={mdmsStateHandler}
      showBackButton={usersBackButton}
    />
  ) : responseData.mdms_state === 'userConsumption' || responseData.mdms_state === 'user_profile' ? (
    // <MdmsUserConsumptionModule statehandler={mdmsStateHandler} showBackButton={props.showBackButton} connection_type={responseData.user_type} />
    <MdmsUserConsumptionModule showBackButton={true} connection_type={connectionType} updateMdmsState={mdmsStateHandler} />
  ) : (
    <Error />
  )
}

export default MdmsUtility
