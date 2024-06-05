// import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable'
import React, { useState } from 'react'
import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap'
import ApplicantAppPending from './applicantAppPending'
import ApplicantApproved from './applicantApproved'
import MeterInstalled from './meterInstalled'
import { ArrowLeft } from 'react-feather'

import { ThinkGasMeterInstalledInfo } from '@store/actions/UtilityProject/ThinkGasMDMS/MeterInstalled'
import { ThinkGasApplicantApprovedInfo } from '@store/actions/UtilityProject/ThinkGasMDMS/ApplicantApproved'
import { ThinkGasApplicantApprovalPendingInfo } from '@store/actions/UtilityProject/ThinkGasMDMS/ApplicantApprovalPending'

import { useSelector, useDispatch, batch } from 'react-redux'

const ApplicantInfo = props => {
  const dispatch = useDispatch()

  // const handleRowClick = (dtr_id, feeder_id, pss_id) => {
  //   props.redirection(0)
  // }

  const handleBackButtonClicked = () => {
    batch(() => {
      dispatch(ThinkGasApplicantApprovedInfo(undefined, true))
      dispatch(ThinkGasApplicantApprovalPendingInfo(undefined, true))
      dispatch(ThinkGasMeterInstalledInfo(undefined, true))
    })

    props.redirection(0, undefined)
  }

  const [active, setActive] = useState('1')

  const toggle = tab => {
    if (active !== tab) {
      setActive(tab)
    }
  }
  return (
    <React.Fragment>
      <h5 onClick={handleBackButtonClicked}>
        <ArrowLeft size={21} className='anim_left' /> Back to Analytics Report
      </h5>
      <Nav className='justify-content-center' tabs>
        <NavItem>
          <NavLink
            active={active === '1'}
            onClick={() => {
              toggle('1')
            }}>
            Applicant Approval Pending
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            active={active === '2'}
            onClick={() => {
              toggle('2')
            }}>
            Applicant Approved
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            active={active === '3'}
            onClick={() => {
              toggle('3')
            }}>
            Meter Installed
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent className='py-50' activeTab={active}>
        <TabPane tabId='1'>
          <ApplicantAppPending tableName='Applicant Approval Pending' additionalInfo={props.additionalInfo} />
        </TabPane>
        <TabPane tabId='2'>
          <ApplicantApproved tableName='Applicant Approved' additionalInfo={props.additionalInfo} />
        </TabPane>
        <TabPane tabId='3'>
          <MeterInstalled redirection={props.redirection} tableName='Meter Installed' additionalInfo={props.additionalInfo} />
        </TabPane>
      </TabContent>
    </React.Fragment>
  )
}

export default ApplicantInfo
