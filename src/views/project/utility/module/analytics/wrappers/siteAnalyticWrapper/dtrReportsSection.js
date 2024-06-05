import PhaseBalance from './PhaseImbalance/phaseBalance'
import GridPerformance from './GridPerformance/gridPerformance'
import PowerVoltage from './PowerVoltage/power&Voltage'
import PowerFactor from './PowerFactor/powerFactor'
import TabularLoss from './TabularLossStatistics/tabularLoss'
import { useContext } from 'react'
import { ThemeColors } from '@src/utility/context/ThemeColors'
import { ArrowLeft } from 'react-feather'
const DtrReportsSection = props => {
  const context = useContext(ThemeColors)

  const backToProjectLevel = () => {
    // Somthing
    props.updateProjectLevel(1, undefined)
  }

  // console.log('DTR Level Report Access ....')
  // console.log(props.dtrLevelReportAccess)
  // console.log('DTR Selected ....')
  // console.log(props.dtrSelected)

  return (
    <div>
      <h5 onClick={backToProjectLevel}>
        <ArrowLeft size={21} className='anim_left' /> Back to Analytics Report
      </h5>
      {props.dtrLevelReportAccess.some(e => e.report_id === 4001) && <PhaseBalance dtrSelected={props.dtrSelected} />}
      {props.dtrLevelReportAccess.some(e => e.report_id === 4002) && <GridPerformance dtrSelected={props.dtrSelected} />}
      {props.dtrLevelReportAccess.some(e => e.report_id === 4003) && <PowerVoltage dtrSelected={props.dtrSelected} />}
      {props.dtrLevelReportAccess.some(e => e.report_id === 4004) && <PowerFactor dtrSelected={props.dtrSelected} />}
      {props.dtrLevelReportAccess.some(e => e.report_id === 4005) && (
        <TabularLoss primary={context.colors.primary.main} warning={context.colors.warning.main} dtrSelected={props.dtrSelected} />
      )}
    </div>
  )
}

export default DtrReportsSection
