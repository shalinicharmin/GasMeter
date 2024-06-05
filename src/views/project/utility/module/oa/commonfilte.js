import { useState } from 'react'
import Flatpickr from 'react-flatpickr'
import { Row, Col, Modal, ModalHeader, ModalBody, Button, InputGroup, Label } from 'reactstrap'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import { toast } from 'react-toastify'
const Commonfilter = props => {
  const [startDateTime, setStartDateTime] = useState(undefined)
  const [startDateTimeAsPerFormat, setStartDateTimeAsPerFormat] = useState(undefined)
  const [endDateTime, setEndDateTime] = useState(undefined)
  const [endDateTimeAsPerFormat, setEndDateTimeAsPerFormat] = useState(undefined)

  const dateTimeFormat = inputDate => {
    return ''.concat(
      inputDate.getFullYear(),
      '-',
      (inputDate.getMonth() + 1).toString().padStart(2, '0'),
      '-',
      inputDate.getDate().toString().padStart(2, '0'),
      ' ',
      inputDate.getHours().toString().padStart(2, '0'),
      ':',
      inputDate.getMinutes().toString().padStart(2, '0'),
      ':',
      inputDate.getSeconds().toString().padStart(2, '0')
    )
  }

  const onStartTimeSelected = time => {
    setStartDateTime(time[0])
    setStartDateTimeAsPerFormat(dateTimeFormat(time[0]))
  }

  const onEndTimeSelected = time => {
    setEndDateTime(time[0])
    setEndDateTimeAsPerFormat(dateTimeFormat(time[0]))
  }

  const onSubmitButtonClicked = () => {
    // to pass data from child to parent
    props.handleFilter()
    const params = {}
    if (startDateTimeAsPerFormat && !endDateTimeAsPerFormat) {
      // Set End Time Error
      toast.error(<Toast msg='Please Select End Time' type='danger' />, { hideProgressBar: true })
    } else if (!startDateTimeAsPerFormat && endDateTimeAsPerFormat) {
      // Set Start Time Error
      toast.error(<Toast msg='Please Select Start Time' type='danger' />, { hideProgressBar: true })
    } else if (startDateTimeAsPerFormat && endDateTimeAsPerFormat) {
      // Both Time are set Compare
      if (startDateTimeAsPerFormat > endDateTimeAsPerFormat) {
        toast.error(<Toast msg='Start Date Time should be smaller than End Date Time' type='danger' />, { hideProgressBar: true })
      } else {
        params['startDate'] = startDateTimeAsPerFormat
        params['endDate'] = endDateTimeAsPerFormat
      }
    }
    props.onsubmitdata(params)
  }

  return (
    <div>
      <Row className=' justify-content-end'>
        <Col lg='12' xs='12'>
          <Label> Start DateTime</Label>
          <Flatpickr
            placeholder='Start Datetime'
            data-enable-time
            id='date-time-picker'
            className='form-control mb-2'
            onChange={onStartTimeSelected}
          />
          <Label> End DateTime</Label>
          <Flatpickr placeholder='End Datetime' data-enable-time id='date-time-picker' className='form-control mb-2' onChange={onEndTimeSelected} />

          <Button color='primary' className='btn-block ' onClick={onSubmitButtonClicked}>
            Submit
          </Button>
        </Col>
      </Row>
    </div>
  )
}

export default Commonfilter
