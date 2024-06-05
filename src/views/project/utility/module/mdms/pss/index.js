import { Row, Col, Card } from 'reactstrap'

import '@styles/react/libs/charts/apex-charts.scss'
import '@styles/base/pages/dashboard-ecommerce.scss'

//Wrapper Functions
import EnergyConsumptionWrapper from '../wrapper/EnergyConsumptionInformationWrapper'
import TopAlertsWrapper from '../wrapper/TopAlertsInformationWrapper'
import UptimeWrapper from '../wrapper/UptimeInformationWrapper'
import BillsGeneratedWrapper from '../wrapper/BillsGeneratedInformationWrapper'
import OperationalInformationWrapper from '../wrapper/OperationalInformationWrapper'

import { useSelector, useDispatch } from 'react-redux'

import { useState } from 'react'

// import { Spinner, Card } from 'reactstrap'

import { handleMDMSHierarchyProgress } from '@store/actions/UtilityProject/MDMS/HierarchyProgress'

const MdmsPssModule = props => {
  const [retry, setRetry] = useState(true)

  const dispatch = useDispatch()
  const responseData = useSelector(state => state.UtilityMDMSHierarchyProgressReducer.responseData)

  // console.log("Hierarchy Progress in redux Store ....")
  // console.log(responseData)

  const onSubstationTableRowClickHandler = (substation, row) => {
    // console.log("Row Clicked in PSS ....")
    // console.log(row)

    //Move Forward to Feeder Level
    props.statehandler('feeder')

    //Update Hierarchy Progress
    dispatch(
      handleMDMSHierarchyProgress({
        ...responseData,
        pss_name: substation,
        pss_real_name: row.substation,
        mdms_state: 'feeder'
      })
    )
  }

  // const monthUpdated = useSelector(state => state.calendarReducer.monthUpdated)

  return (
    <div id='dashboard-ecommerce'>
      <Row className='match-height'>
        <Col>
          <EnergyConsumptionWrapper
            statehandler={onSubstationTableRowClickHandler}
            txtLen={16}
            tableName={'Substation Level'}
            hierarchy={'pss'}
          />
          {/* <Row className='match-height'>
            <UptimeWrapper hierarchy={'pss'} />
            <BillsGeneratedWrapper hierarchy={'pss'} />
          </Row> */}
        </Col>

        {/* <Col lg='4'>
          <Row className='match-height'>
            <TopAlertsWrapper hierarchy={'pss'} height='height-615' />
          </Row>
        </Col> */}
        <OperationalInformationWrapper hierarchy={'pss'} />
      </Row>
    </div>
  )
}

export default MdmsPssModule
