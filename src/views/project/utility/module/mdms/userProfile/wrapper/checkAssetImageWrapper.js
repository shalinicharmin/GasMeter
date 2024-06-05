import { Row, Col, Modal, ModalHeader, ModalBody } from 'reactstrap'
import AnalyticSmallCard from '@src/views/ui-elements/cards/gpCards/analyticSmallCard'
import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'
import { Image } from 'react-feather'
import { useContext, useState, useEffect } from 'react'

import { useSelector, useDispatch } from 'react-redux'

import { handleConsumerTotalConsumptionData } from '@store/actions/UtilityProject/MDMS/userprofile'

const AssetImageWrapper = props => {
  // const dispatch = useDispatch()
  // const responseData = useSelector(state => state.UtilityMdmsConsumerConsumptionReducer.responseData)
  // const callAPI = useSelector(state => state.UtilityMdmsConsumerConsumptionReducer)
  // const rawData = {
  //   title: 'Aug 21 Consumption',
  //   statistics: '32.5 Kwh',
  //   series: [
  //     {
  //       data: [0, 20, 5, 30, 15, 45]
  //     }
  //   ]
  // }
  const [centeredModal, setCenteredModal] = useState(false)

  // useEffect(() => {
  //   if (callAPI) {
  //     const data = {
  //       title: 'Aug 21 Consumption',
  //       statistics: '32.5 Kwh',
  //       series: [
  //         {
  //           data: [0, 20, 5, 30, 15, 45]
  //         }
  //       ]
  //     }

  //     dispatch(handleConsumerTotalConsumptionData(data, false))
  //   }
  // }, [callAPI])

  return (
    <Col xl='4' md='6' xs='12'>
      <StatsHorizontal
        icon={<Image size={21} />}
        color='info'
        stats='Check asset images'
        statTitle=''
        click={() => setCenteredModal(!centeredModal)}
      />
      <Modal isOpen={centeredModal} toggle={() => setCenteredModal(!centeredModal)} className='modal-dialog-centered modal_size'>
        <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>Asset Image</ModalHeader>
        <ModalBody>
          {/* <ChartBarLine /> */}
          <Col sm='12'>
            {/* <BarChart successColorShade={successColorShade} labelColor={labelColor} tooltipShadow={tooltipShadow} gridLineColor={gridLineColor} /> */}
          </Col>
          <Col sm='12'>
            {/* <LineChart
              warningColorShade={warningColorShade}
              lineChartDanger={lineChartDanger}
              lineChartPrimary={lineChartPrimary}
              labelColor={labelColor}
              tooltipShadow={tooltipShadow}
              gridLineColor={gridLineColor}
            /> */}
          </Col>
        </ModalBody>
      </Modal>
    </Col>
  )
}

export default AssetImageWrapper
