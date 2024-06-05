import { Row, Col } from 'reactstrap'

import '@styles/react/libs/charts/apex-charts.scss'
import '@styles/base/pages/dashboard-ecommerce.scss'

//Wrapper Functions
import EnergyConsumptionWrapper from '../wrapper/EnergyConsumptionInformationWrapper'
import TopAlertsWrapper from '../wrapper/TopAlertsInformationWrapper'
import UptimeWrapper from '../wrapper/UptimeInformationWrapper'
import BillsGeneratedWrapper from '../wrapper/BillsGeneratedInformationWrapper'
import OperationalInformationWrapper from '../wrapper/OperationalInformationWrapper'

import { useSelector, useDispatch } from 'react-redux'

import { handleMDMSHierarchyProgress } from '@store/actions/UtilityProject/MDMS/HierarchyProgress'

import {
  handleEnergyConsumptionData,
  handleAlertsData,
  handleOpertationalStatisticsData,
  handleUptimeData,
  handleBillsGeneratedData
} from '@store/actions/UtilityProject/MDMS/feeder'
import { ChevronLeft } from 'react-feather'

const MdmsFeederModule = props => {
  const dispatch = useDispatch()
  const responseData = useSelector(state => state.UtilityMDMSHierarchyProgressReducer.responseData)

  // console.log("Hierarchy Progress in redux Store ....")
  // console.log(responseData)

  const onFeederTableRowClickHandler = (feeder, row) => {
    // console.log("Feeder Row Clicked ...")
    // console.log(row)

    //Move to DTR Level
    props.statehandler('dtr')

    //Update Hierarchy Progress
    dispatch(
      handleMDMSHierarchyProgress({
        ...responseData,
        feeder_name: feeder,
        feeder_real_name: row.feeder,
        mdms_state: 'dtr'
      })
    )
  }

  const onBackButtonClickHandler = () => {
    //Move back to pss level
    props.statehandler('pss')

    //Clear all feeder data from redux store
    dispatch(handleEnergyConsumptionData([], true))
    dispatch(handleAlertsData([], true))
    dispatch(handleUptimeData([], true))
    dispatch(handleBillsGeneratedData([], true))
    dispatch(handleOpertationalStatisticsData([], true))

    //Clear feeder name from hierarchy progress
    dispatch(
      handleMDMSHierarchyProgress({
        ...responseData,
        feeder_name: '',
        feeder_real_name: '',
        mdms_state: 'pss'
      })
    )
  }

  return (
    <div id='dashboard-ecommerce'>
      <span onClick={onBackButtonClickHandler} className='cursor-pointer'>
        <ChevronLeft className='mb_3 anim_left' /> Back to substation
      </span>
      <Row className='match-height'>
        <Col>
          <EnergyConsumptionWrapper statehandler={onFeederTableRowClickHandler} txtLen={17} tableName={'Feeder Level'} hierarchy={'feeder'} />
          {/* <Row className='match-height'>
            <UptimeWrapper hierarchy={'feeder'} />

            <BillsGeneratedWrapper hierarchy={'feeder'} />
          </Row> */}
        </Col>
        {/* <Col md='4'>
          <Row className='match-height'>
            <TopAlertsWrapper hierarchy={'feeder'} height='height-595' />
          </Row>
        </Col> */}
        <OperationalInformationWrapper hierarchy={'feeder'} />
      </Row>
    </div>
  )
}

export default MdmsFeederModule
