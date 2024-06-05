import { useEffect, useState } from 'react'
import { Row, Col } from 'reactstrap'
import { useLocation } from 'react-router-dom'
import { useSelector, useDispatch, batch } from 'react-redux'

import GoogleMapsWrapper from './GoogleMapsWrapper'
import ProjectArea from './ProjectArea'
import OperationalStatistics from './OperationalStatistics'
import PrepaidPostpaidCount from './PrepaidPostpaidCount'

import { handleProjectArea, handleOperationalStatistics, handlePrepaidPostpaidCount } from '@store/actions/UtilityProject/Summary'

import '@styles/react/libs/charts/apex-charts.scss'
import '@styles/base/pages/dashboard-ecommerce.scss'

import { handleCurrentSelectedModuleStatus } from '@store/actions/Misc/currentSelectedModuleStatus'

const SummaryUtility = props => {
  const dispatch = useDispatch()
  const responseData = useSelector(state => state.UtilityMDMSHierarchyProgressReducer.responseData)
  const currentSelectedModuleStatus = useSelector(state => state.CurrentSelectedModuleStatusReducer.responseData)

  // console.log('Hierarchy Progress ...')
  // console.log(responseData)

  const location = useLocation()
  const projectName = location.pathname.split('/')[2] === 'sbpdcl' ? 'ipcl' : location.pathname.split('/')[2]

  // Check If project is Changed
  const [selected_project, set_selected_project] = useState(undefined)
  if (currentSelectedModuleStatus.prev_project) {
    if (
      selected_project !== currentSelectedModuleStatus.project &&
      currentSelectedModuleStatus.prev_project !== currentSelectedModuleStatus.project
    ) {
      set_selected_project(currentSelectedModuleStatus.project)
      dispatch(handleProjectArea([], true))
      dispatch(handleOperationalStatistics([], true))
      dispatch(handlePrepaidPostpaidCount([], true))
    }
  }
  return (
    <div id='dashboard-ecommerce'>
      <Row className='match-height'>
        <ProjectArea project={projectName} />
        <OperationalStatistics project={projectName} />
        <PrepaidPostpaidCount project={projectName} />
        <GoogleMapsWrapper project={projectName} />
      </Row>
    </div>
  )
}

export default SummaryUtility
