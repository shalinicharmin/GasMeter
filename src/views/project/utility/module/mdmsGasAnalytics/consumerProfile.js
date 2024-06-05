import { useState, useEffect } from 'react'
import { useSelector, useDispatch, batch } from 'react-redux'

import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'

import { Card, Col, Row } from 'reactstrap'
import PaymentHistoryData from './paymentHistoryData'
import MeterReadingData from './meterReadingData'
import ConsumerInfo from './consumerInfo'
import MeterInfo from './meterInfo'
import { ArrowLeft, ChevronsRight } from 'react-feather'

import { ThinkGasMeterReadingInfo } from '@store/actions/UtilityProject/ThinkGasMDMS/MeterReading'
import { ThinkGasPaymentHistoryInfo } from '@store/actions/UtilityProject/ThinkGasMDMS/PaymentHistory'
import { ThinkGasMeterInfo } from '@store/actions/UtilityProject/ThinkGasMDMS/MeterInfo'
import { ThinkGasConsumerInfo } from '@store/actions/UtilityProject/ThinkGasMDMS/ConsumerInfo'

const ConsumerProfile = props => {
  const dispatch = useDispatch()

  const [infoSelected, setInfoSelected] = useState(1)

  const handleClickEvent = params => {
    // console.log(params)
    setInfoSelected(params)
  }
  const handleBackButtonClicked = () => {
    batch(() => {
      dispatch(ThinkGasMeterReadingInfo(undefined, true))
      dispatch(ThinkGasPaymentHistoryInfo(undefined, true))
      dispatch(ThinkGasConsumerInfo(undefined, true))
      dispatch(ThinkGasMeterInfo(undefined, true))
    })

    const additionalInfo = {
      GEOGRAPHICAL_AREA: props.additionalInfo.GEOGRAPHICAL_AREA,
      CHARGED_AREA: props.additionalInfo.CHARGED_AREA,
      CITY: props.additionalInfo.CITY,
      APPLICATION_APPROVED_COUNT: props.additionalInfo.APPLICATION_APPROVED_COUNT,
      APPLICATION_PENDING_COUNT: props.additionalInfo.APPLICATION_PENDING_COUNT,
      METER_INSTALLED_COUNT: props.additionalInfo.METER_INSTALLED_COUNT
    }

    // console.log(props.additionalInfo)

    props.redirection(1, additionalInfo)
  }

  const renderComponent = () => {
    if (infoSelected === 1) {
      return <ConsumerInfo additionalInfo={props.additionalInfo} />
    } else if (infoSelected === 2) {
      return <MeterInfo additionalInfo={props.additionalInfo} />
    } else if (infoSelected === 3) {
      return <MeterReadingData tableName='Meter Reading Data' additionalInfo={props.additionalInfo} />
    } else if (infoSelected === 4) {
      return <PaymentHistoryData tableName='Payment History Data' additionalInfo={props.additionalInfo} />
    }
  }

  return (
    <>
      <h5 onClick={handleBackButtonClicked}>
        <ArrowLeft size={21} className='anim_left' /> Back to Analytics Report
      </h5>
      <h3 className='mt-2'> Consumer Profile</h3>

      <Row>
        {/* Stats With Icons Horizontal */}
        <Col lg='3' sm='6' onClick={() => handleClickEvent(1)}>
          <StatsHorizontal icon={<ChevronsRight size={21} />} color='primary' stats='Consumer Information' clas='h4' />
        </Col>
        <Col lg='3' sm='6' onClick={() => handleClickEvent(2)}>
          <StatsHorizontal icon={<ChevronsRight size={21} />} color='success' stats='Meter Information' clas='h4' />
        </Col>
        <Col lg='3' sm='6' onClick={() => handleClickEvent(3)}>
          <StatsHorizontal icon={<ChevronsRight size={21} />} color='danger' stats='Meter Reading Data' clas='h4' />
        </Col>
        <Col lg='3' sm='6' onClick={() => handleClickEvent(4)}>
          <StatsHorizontal icon={<ChevronsRight size={21} />} color='warning' stats='Payment History Data' clas='h4' />
        </Col>
        {/* Stats With Icons Horizontal */}

        {renderComponent()}
      </Row>
    </>
  )
}

export default ConsumerProfile
