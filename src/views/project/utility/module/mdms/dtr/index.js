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
} from '@store/actions/UtilityProject/MDMS/dtr'
import { ChevronLeft } from 'react-feather'

const MdmsDtrModule = props => {
  const dispatch = useDispatch()
  const responseData = useSelector(state => state.UtilityMDMSHierarchyProgressReducer.responseData)

  const onDtrTableRowClickHandler = (dtr, row) => {
    // console.log("DTR Row Clicked ...")
    // console.log(row)

    //Move to user level
    props.statehandler('user')

    //Update Hierarchy Progress
    dispatch(
      handleMDMSHierarchyProgress({
        ...responseData,
        dtr_name: dtr,
        dtr_real_name: row.dtr,
        mdms_state: 'user'
      })
    )
  }

  const onBackButtonClickHandler = () => {
    //Move back to feeder level
    props.statehandler('feeder')

    //Clear all dtr data from redux store
    dispatch(handleEnergyConsumptionData([], true))
    dispatch(handleAlertsData([], true))
    dispatch(handleUptimeData([], true))
    dispatch(handleBillsGeneratedData([], true))
    dispatch(handleOpertationalStatisticsData([], true))

    //Clear dtr name from Hierarchy Progress store
    dispatch(
      handleMDMSHierarchyProgress({
        ...responseData,
        dtr_name: '',
        dtr_real_name: '',
        mdms_state: 'feeder'
      })
    )
  }

  return (
    <div id='dashboard-ecommerce'>
      <span onClick={onBackButtonClickHandler} className='cursor-pointer'>
        <ChevronLeft className='mb_3 anim_left' /> Back to feeder
      </span>
      <Row className='match-height'>
        <Col>
          <EnergyConsumptionWrapper statehandler={onDtrTableRowClickHandler} txtLen={27} tableName={'DTR Level'} hierarchy={'dtr'} />
          {/* <Row className='match-height'>
            <UptimeWrapper hierarchy={'dtr'} />

            <BillsGeneratedWrapper hierarchy={'dtr'} />
          </Row> */}
        </Col>

        {/* <Col md='4'>
          <Row className='match-height'>
            <TopAlertsWrapper hierarchy={'dtr'} height='height-595' />
          </Row>
        </Col> */}
        <OperationalInformationWrapper hierarchy={'dtr'} />
      </Row>
    </div>
  )
}

export default MdmsDtrModule
