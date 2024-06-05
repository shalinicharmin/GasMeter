import { useLocation } from "react-router-dom"

import jwt_decode from "jwt-decode"

import Error from "@src/views/Error"
import SLA_Reports from "../utility/module/sla-Reports"
import Sat from "../utility/module/sat"
import Billing_Engine from "../utility/module/billingEngine"
import HealthPortal from "../coliving/module/healthPortal"
import MeterConfigurationUtility from "../utility/module/meterconfigurationUtility"
import MDMSGasAnalytics from "@src/views/project/utility/module/mdmsGasAnalytics"
import SummaryUtility from "@src/views/project/utility/module/summary"
import MdmsUtility from "@src/views/project/utility/module/mdms"
import AnalyticsUtility from "@src/views/project/utility/module/analytics"
import FfmUtility from "@src/views/project/utility/module/ffm"
import GisUtility from "@src/views/project/utility/module/gis"
import OaUtility from "@src/views/project/utility/module/oa"
import HesUppcl from "./hesUPPCl"

// ** Utils

const UtilityUPPCL = (props) => {
  const { module } = props

  const location = useLocation()
  const projectName =
    location.pathname.split("/")[2] === "sbpdcl" ? "ipcl" : location.pathname.split("/")[2]
  // const [mdmsFlow, setMdmsFlow] = useState(undefined)
  const email_address = jwt_decode(localStorage.getItem("accessToken")).userData.email
  const componentReturn =
    module === "summary" ? (
      <SummaryUtility project={projectName[2]} />
    ) : module === "mdms" ? (
      // <MdmsUtility />
      email_address === "thinkgas@grampower.com" ? (
        <MDMSGasAnalytics />
      ) : (
        <MdmsUtility />
      )
    ) : module === "hes" ? (
      <HesUppcl />
    ) : module === "analytics" ? (
      <AnalyticsUtility project={projectName[2]} />
    ) : module === "ffm-control" ? (
      <FfmUtility project={projectName[2]} />
    ) : module === "gis" ? (
      <GisUtility project={projectName[2]} />
    ) : module === "operations-automation" ? (
      <OaUtility project={projectName[2]} />
    ) : module === "meter-configuration" ? (
      <MeterConfigurationUtility />
    ) : module === "health-portal" ? (
      <HealthPortal />
    ) : module === "prepaid-engine" ? (
      <Prepaid_Engine />
    ) : module === "billing-engine" ? (
      <Billing_Engine />
    ) : module === "sat" ? (
      <Sat />
    ) : module === "sla-reports" ? (
      <SLA_Reports />
    ) : (
      <Error />
    )
  return componentReturn
}

export default UtilityUPPCL
