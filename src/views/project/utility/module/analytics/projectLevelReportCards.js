import React from "react"
import { CardBody, Card, CardTitle, Row, Col } from "reactstrap"
import StatsHorizontal from "@components/widgets/stats/StatsHorizontal"
import { Zap } from "react-feather"

// Project Level Reports Tab
import RechargeReport from "./wrappers/projectLevelRechargeReportWrapper/rechargeReportTab"
import DeductionReport from "./wrappers/projectLevelDeductionReportWrapper/deductionReportTab"
import BillingReport from "./wrappers/projectLevelBillingReportWrapper/billingReportTab"
import ConnectionDisconnectionReport from "./wrappers/projectLevelConnectionDisconnectionReportWrapper/connectionDisconnectionReportTab"
// import ConnectionDisconnectionReportNew from './wrappers/projectLevelConnectionDisconnectionReportWrapper/connectionDisconnectionReportTab'
// import CommunicationReportNew from './wrappers/projectLevelCommunicationReportWrapper/communicationReportTab'
import CommunicationReport from "./wrappers/projectLevelCommunicationReportWrapper/communicationReportTab"
import PowerAvailabilityReport from "./wrappers/projectLevelPowerAvailabilityReportWrapper/powerAvailabilityReportTab"
import DailyOperationReport from "./wrappers/projectLevelDailyOperationsReport/dailyOperationReport"

const ProjectLevelReport = (props) => {
  const _data = props.access ? JSON.parse(props.access) : ""

  return (
    <>
      <div>
        <h3 className='mb-2 ml_5'> Project Level Report</h3>
        <Row>
          {props.projectLevelReportAccess.some((e) => e.report_id === 1001) && (
            <RechargeReport
              dtr_list={props.dtr_list}
              pss_list={props.pss_list}
              feeder_list={props.feeder_list}
            />
          )}
          {props.projectLevelReportAccess.some((e) => e.report_id === 1002) && (
            <DeductionReport
              dtr_list={props.dtr_list}
              pss_list={props.pss_list}
              feeder_list={props.feeder_list}
            />
          )}
          {props.projectLevelReportAccess.some((e) => e.report_id === 1003) && (
            <BillingReport
              dtr_list={props.dtr_list}
              pss_list={props.pss_list}
              feeder_list={props.feeder_list}
            />
          )}
          {props.projectLevelReportAccess.some((e) => e.report_id === 1004) && (
            <ConnectionDisconnectionReport
              dtr_list={props.dtr_list}
              pss_list={props.pss_list}
              feeder_list={props.feeder_list}
            />
          )}
          {props.projectLevelReportAccess.some((e) => e.report_id === 1005) && (
            <CommunicationReport
              dtr_list={props.dtr_list}
              pss_list={props.pss_list}
              feeder_list={props.feeder_list}
            />
          )}
          {props.projectLevelReportAccess.some((e) => e.report_id === 1006) && (
            <PowerAvailabilityReport
              dtr_list={props.dtr_list}
              pss_list={props.pss_list}
              feeder_list={props.feeder_list}
            />
          )}
          {props.projectLevelReportAccess.some((e) => e.report_id === 1007) && (
            <DailyOperationReport
              dtr_list={props.dtr_list}
              pss_list={props.pss_list}
              feeder_list={props.feeder_list}
            />
          )}
        </Row>
      </div>
    </>
  )
}

export default ProjectLevelReport
