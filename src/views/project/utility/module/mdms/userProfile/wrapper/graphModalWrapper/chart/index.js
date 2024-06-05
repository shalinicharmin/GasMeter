import { Row, Col } from 'reactstrap'
import { useContext } from 'react'
// import Chart
import BarChart from './chartjsBarChart'
import LineChart from './chartjsLineChart'
import ApexColumnChart from './apexColumnChart'
import ApexLineChart from './apexLineChart'
// ** Custom Hooks
import { useSkin } from '@hooks/useSkin'
// ** Context
import { ThemeColors } from '@src/utility/context/ThemeColors'

const ChartBarLine = props => {
  const { colors } = useContext(ThemeColors),
    [skin, setSkin] = useSkin(),
    labelColor = skin === 'dark' ? '#b4b7bd' : '#6e6b7b',
    tooltipShadow = 'rgba(0, 0, 0, 0.25)',
    gridLineColor = 'rgba(200, 200, 200, 0.2)',
    lineChartPrimary = '#666ee8',
    lineChartDanger = '#ff4961',
    warningColorShade = '#ffe802',
    warningLightColor = '#FDAC34',
    successColorShade = '#28dac6',
    primaryColorShade = '#836AF9',
    infoColorShade = '#299AFF',
    yellowColor = '#ffe800',
    greyColor = '#4F5D70',
    blueColor = '#2c9aff',
    blueLightColor = '#84D0FF',
    greyLightColor = '#EDF1F4'

  return (
    // //   Apex chart
    // <Row>
    //   <Col sm='12'>
    //     <ApexColumnChart direction='ltr' />
    //   </Col>
    //   <Col sm='12'>
    //     <ApexLineChart direction='ltr' warning={colors.warning.main} />
    //   </Col>
    // </Row>

    //   Chart js
    <div>
      <Col sm='12'>
        <BarChart successColorShade={successColorShade} labelColor={labelColor} tooltipShadow={tooltipShadow} gridLineColor={gridLineColor} />
      </Col>
      <Col sm='12'>
        <LineChart
          warningColorShade={warningColorShade}
          lineChartDanger={lineChartDanger}
          lineChartPrimary={lineChartPrimary}
          labelColor={labelColor}
          tooltipShadow={tooltipShadow}
          gridLineColor={gridLineColor}
        />
      </Col>
    </div>
  )
}

export default ChartBarLine
