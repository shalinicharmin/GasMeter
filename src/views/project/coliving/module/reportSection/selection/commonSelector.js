import Select from 'react-select'
import { selectThemeColors } from '@utils'
import Flatpickr from 'react-flatpickr'
import { useState } from 'react'

import { Col, Button, Row, Label, FormGroup, Input, Card, CardBody } from 'reactstrap'
import { formattedDate, getDefaultDateRange } from '@src/utility/Utils.js'

import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'

const CommonSelector = props => {
  const defaultDates = getDefaultDateRange()

  const [startDateSelected, setStartDateSelected] = useState(defaultDates.startDate)
  const [endDateSelected, setEndDateSelected] = useState(defaultDates.endDate)

  const [pssSelected, setPssSelected] = useState(undefined)
  const [pssList, setPssList] = useState(props.pss_list)

  const [feederSelected, setFeederSelected] = useState(undefined)
  const [feederList, setFeederList] = useState(props.feeder_list)

  const [dtrSelected, setDtrSelected] = useState(undefined)
  const [dtrList, setDtrList] = useState(props.dtr_list)

  const [reportSelected, setReportSelected] = useState(props.default_report_type)
  const [reportsList, setReportList] = useState(props.report_types)

  const [consumerMeterSerialNumber, setConsumerMeterSerialNumber] = useState(undefined)

  const onDateRangeSelected = val => {
    if (val && val.length >= 2) {
      const start_date = val[0]
      const end_date = val[1]
      const Difference_In_Time = end_date.getTime() - start_date.getTime()
      const difference_in_days = Difference_In_Time / (1000 * 3600 * 24)

      if (difference_in_days <= 30) {
        setStartDateSelected(formattedDate(val[0]))
        setEndDateSelected(formattedDate(val[1]))
      } else {
        toast.error(<Toast msg={'Date range cannot be more than 30 days'} type='danger' />, { hideProgressBar: true })
      }
    }
  }

  const onPssSelected = val => {
    // console.log('PSS Selected ....')
    // console.log(val)

    if (val) {
      setPssSelected(val)

      // Set Feeder DropDown as per pss selected
      const feeder_list_dummy = []
      for (let i = 0; i < props.feeder_list.length; i++) {
        if (val.pss_id === props.feeder_list[i].pss_id) {
          feeder_list_dummy.push(props.feeder_list[i])
        }
      }

      setFeederList(feeder_list_dummy)
      setDtrList([])

      setFeederSelected(undefined)
      setDtrSelected(undefined)
    } else {
      // console.log('PSS Selected in null ....')

      setPssList(props.pss_list)
      setDtrList(props.dtr_list)
      setFeederList(props.feeder_list)
      setPssSelected(undefined)
      setFeederSelected(undefined)
      setDtrSelected(undefined)
    }
  }

  const onFeederSelected = val => {
    if (val) {
      setFeederSelected(val)

      const dtr_list_dummy = []
      // Set DTR Dropdown as per feeder selected
      for (let i = 0; i < props.dtr_list.length; i++) {
        if (val.feeder_id === props.dtr_list[i].feeder_id) {
          dtr_list_dummy.push(props.dtr_list[i])
        }
      }
      setDtrList(dtr_list_dummy)
    } else {
      setFeederSelected(undefined)
      if (pssSelected) {
        setDtrList([])
        setDtrSelected(undefined)
      } else {
        setPssList(props.pss_list)
        setFeederList(props.feeder_list)
        setDtrList(props.dtr_list)

        setPssSelected(undefined)
        setFeederSelected(undefined)
        setDtrSelected(undefined)
      }
    }
  }

  const onDTRSelected = val => {
    if (val) {
      setDtrSelected(val)
    } else {
      setDtrSelected(undefined)
    }
  }

  const onConsumerIdTyped = e => {
    // console.log('Consumer Meter Serial Number Typed ....')
    // console.log(e.target.value)

    if (e.target.value) {
      setConsumerMeterSerialNumber(e.target.value)
      setPssList([])
      setFeederList([])
      setDtrList([])

      setPssSelected(undefined)
      setDtrSelected(undefined)
      setFeederSelected(undefined)
    } else {
      setPssList(props.pss_list)
      setFeederList(props.feeder_list)
      setDtrList(props.dtr_list)

      setPssSelected(undefined)
      setDtrSelected(undefined)
      setFeederSelected(undefined)

      setConsumerMeterSerialNumber(undefined)
    }
  }

  const onSearchButtonClicked = () => {
    // console.log('on Search Button Clicked .....')

    // console.log(dtrSelected)

    props.onSearchButtonClicked(
      !props.report_types
        ? {
            startDate: startDateSelected ? startDateSelected : '',
            endDate: endDateSelected ? endDateSelected : '',
            pssId: pssSelected ? pssSelected.pss_id : '',
            feederId: feederSelected ? feederSelected.feeder_id : '',
            siteId: dtrSelected ? dtrSelected.dtr_id : '',
            consumerId: consumerMeterSerialNumber ? consumerMeterSerialNumber : ''
          }
        : {
            reportId: reportSelected.value,
            intervalDays: reportSelected.numberOfDays ? reportSelected.numberOfDays : '',
            pssId: pssSelected ? pssSelected.pss_id : '',
            feederId: feederSelected ? feederSelected.feeder_id : '',
            siteId: dtrSelected ? dtrSelected.dtr_id : '',
            consumerId: consumerMeterSerialNumber ? consumerMeterSerialNumber : ''
          }
    )
  }

  const onReportTypeSelected = val => {
    setReportSelected(val)
  }

  return (
    <Row>
      <Col className='mb-1' xl='4' md='6' sm='12'>
        {!props.report_types && (
          <Flatpickr
            placeholder='Select date ...'
            onChange={onDateRangeSelected}
            className='form-control'
            options={{ mode: 'range', dateFormat: 'Y-m-d', defaultDate: [endDateSelected, startDateSelected] }}
          />
        )}
        {props.report_types && (
          <Select
            id='selectreporttype'
            name='reporttype'
            key={`my_unique_select_key__${reportSelected}`}
            theme={selectThemeColors}
            className='react-select zindex_1001'
            classNamePrefix='select'
            value={reportSelected}
            closeMenuOnSelect={true}
            onChange={onReportTypeSelected}
            options={reportsList}
            isClearable={false}
            placeholder='Select Report Type'
          />
        )}
      </Col>

      {/* Select PSS ID */}
      <Col className='mb-1' xl='4' md='6' sm='12'>
        <Select
          id='selectpss'
          name='pss'
          key={`my_unique_select_key__${pssSelected}`}
          theme={selectThemeColors}
          className='react-select zindex_1001'
          classNamePrefix='select'
          value={pssSelected}
          closeMenuOnSelect={true}
          onChange={onPssSelected}
          options={pssList}
          isClearable={true}
          placeholder='Select PSS ID'
        />
      </Col>

      {/* Select FEEDER ID */}
      <Col className='mb-1' xl='4' md='6' sm='12'>
        <Select
          id='selectfeeder'
          name='feeder'
          key={`my_unique_select_key__${feederSelected}`}
          isClearable={true}
          theme={selectThemeColors}
          className='react-select'
          classNamePrefix='select'
          value={feederSelected}
          onChange={onFeederSelected}
          closeMenuOnSelect={true}
          options={feederList}
          placeholder='Select Feeder ID'
        />
      </Col>

      {/* <Col className='' xl='4' md='6' sm='12'>
        <Select
          isClearable={true}
          closeMenuOnSelect={false}
          theme={selectThemeColors}
          // components={animatedComponents}
          //   onChange={setSelectedMeterSerialNumber}
          options={colorOptions}
          className='react-select zindex_1000'
          classNamePrefix='select'
          placeholder='Select Subdiv Id'
        />
      </Col> */}

      {/* Select SITE ID */}
      <Col className='' xl='3' md='6' sm='12'>
        <Select
          id='selectdtr'
          name='dtr'
          key={`my_unique_select_key__${dtrSelected}`}
          isClearable={true}
          closeMenuOnSelect={true}
          theme={selectThemeColors}
          value={dtrSelected}
          onChange={onDTRSelected}
          options={dtrList}
          className='react-select zindex_1000'
          classNamePrefix='select'
          placeholder='Select Site'
        />
      </Col>
      <Col className='' xl='3' md='6' sm='12'>
        <FormGroup>
          <Input type='text' id='Consumer Serial No.' placeholder='Consumer Number...' onChange={onConsumerIdTyped} />
        </FormGroup>
      </Col>
      <Col lg='2' md='6' xs='6'>
        <Button color='primary' className='btn-block' onClick={onSearchButtonClicked}>
          Search
        </Button>
      </Col>
    </Row>
  )
}

export default CommonSelector
