import { useState, useEffect } from 'react'
import { DownloadCloud, Loader } from 'react-feather'
import { Modal, ModalBody, ModalHeader, UncontrolledTooltip, Col, Row, FormGroup, Input, Form, Button, Label, CustomInput, Spinner } from 'reactstrap'
import Select from 'react-select'
import Flatpickr from 'react-flatpickr'
import '@styles/react/libs/flatpickr/flatpickr.scss'
// import { useSelector } from 'react-redux'
import ExcelExport from 'export-xlsx'
import useJwt from '@src/auth/jwt/useJwt'

import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import authLogout from '../../../../../../auth/jwt/logoutlogic'

import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'

function SlaReport() {
  const dispatch = useDispatch()
  const history = useHistory()

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  // const responseData = useSelector(state => state.UtilityMdmsFlowReducer)
  const responseData = useSelector(state => state.UtilityMDASAssetListReducer)
  const [centeredModal, setCenteredModal] = useState(false)
  const [dtrList, setDtrList] = useState(undefined)
  const [dtr, setDtr] = useState(undefined)
  const [startDateTime, setStartDateTime] = useState()
  const [endDateTime, setEndDateTime] = useState()
  const [loader, setLoader] = useState(false)

  useEffect(() => {
    const tempDtr = []
    const dtrListData = responseData.responseData.dtr_list

    if (dtrListData.length > 0) {
      for (const ele of dtrListData) {
        const temp = {}
        temp['value'] = ele['dtr_id']
        temp['label'] = ele['dtr_name']
        temp['pss_id'] = ele['pss_id']
        temp['feeder_id'] = ele['feeder_id']
        temp['isFixed'] = 'true'
        tempDtr.push(temp)
      }
      setDtrList(tempDtr)
    }
  }, [])

  // function to dowload data in excel
  const DownloadExcel = (filName, tableData) => {
    //table format to download data in excel
    const data_temp = [
      {
        table1: tableData.result['report']
      }
    ]

    const column_name = []
    for (const i in tableData.result['report'][0]) {
      // console.log(i)
      const temp = {
        name: `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' '),
        key: i,
        width: 25
      }
      column_name.push(temp)
    }

    const data_temp_format = {
      // Table settings
      fileName: filName,
      workSheets: [
        {
          sheetName: filName.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, ''),
          startingRowNumber: 2,
          gapBetweenTwoTables: 2,
          tableSettings: {
            table1: {
              tableTitle: `From datetime: ${tableData.result['from_datetime']}, To datetime: ${tableData.result['to_datetime']}`,
              headerDefinition: column_name
            }
          }
        }
      ]
    }

    const excelExport = new ExcelExport()
    excelExport.downloadExcel(data_temp_format, data_temp)
  }

  // API call to fetch SLA report
  const fetchSlaReport = async params => {
    return await useJwt
      .getSlaReport(params)
      .then(res => {
        const status = res.status
        return [status, res]
      })
      .catch(err => {
        if (err.response) {
          const status = err.response.status
          return [status, err]
        } else {
          return [0, err]
        }
      })
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!dtr || !startDateTime || !endDateTime) {
      alert('All fields are mandatory.')
      return false
    }

    if (startDateTime === endDateTime) {
      toast.error(<Toast msg={'Start date-time and End date-time cannot be same'} type='danger' />, { hideProgressBar: true })
      return false
    }

    setLoader(true)

    const params = {
      project: 'ipcl',
      site: dtr.value,
      from_datetime: startDateTime,
      to_datetime: endDateTime
    }
  

    try {
      const [statusCodeSLA, responseSLA] = await fetchSlaReport(params)

      // console.log('SLA Report Data ')
      // console.log(responseSLA)

      if (statusCodeSLA) {
        if (statusCodeSLA === 401 || statusCodeSLA === 403) {
          setLogout(true)
        } else if (statusCodeSLA === 200) {
          DownloadExcel(`SLA Report ${responseSLA.data.data.result['from_datetime']}`, responseSLA.data.data)
        } else {
          toast.error(<Toast msg={'Something went wrong.'} type='danger' />, { hideProgressBar: true })
        }
      }
    } finally {
      setLoader(false)
    }
  }

  const handleDtr = e => {
    setDtr(e)
  }

  return (
    <>
      <span className='cursor-pointer float-right' onClick={setCenteredModal}>
        <DownloadCloud className='mb_5 ml_12 mt_9' id='sla_report' size={15} />
      </span>
      <UncontrolledTooltip placement='top' target='sla_report'>
        Download SLA report
      </UncontrolledTooltip>
      {/* SLA Report configuration */}
      <Modal isOpen={centeredModal} toggle={() => setCenteredModal(!centeredModal)} className={`modal-md`}>
        <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>
          <h4 className='modal-title'>SLA Report configuration</h4>
        </ModalHeader>
        <ModalBody>
          <Form className='p-1' id='slaReport' onSubmit={handleSubmit}>
            <Row>
              <Col sm='12'>
                <FormGroup>
                  <Label for='selectConsumer'>Select site</Label>
                  <Select
                    // id='selectsite'
                    onChange={handleDtr}
                    value={dtr}
                    isClearable={true}
                    closeMenuOnSelect={true}
                    options={dtrList}
                    className='react-select zindex_1000'
                    classNamePrefix='select'
                    placeholder='Select site ...'
                  />
                </FormGroup>
              </Col>
              <Col sm='6'>
                <FormGroup>
                  <Label for='selectSite'>From datetime</Label>
                  <Flatpickr
                    id='datetimeFrom'
                    className='form-control'
                    onClose={value => setStartDateTime(value[0].toISOString())}
                    placeholder='Select from datetime ...'
                    options={{ enableTime: true }}
                  />
                </FormGroup>
              </Col>
              <Col sm='6'>
                <FormGroup>
                  <Label for='selectSite'>To datetime</Label>
                  <Flatpickr
                    id='datetimeTo'
                    className='form-control'
                    onClose={value => setEndDateTime(value[0].toISOString())}
                    placeholder='Select to datetime ...'
                    options={{ enableTime: true }}
                  />
                </FormGroup>
              </Col>
              <Col sm='12' className='mt-2 text-center'>
                <Button.Ripple className='mr-1' color='primary' size='sm' type='submit'>
                  Submit {loader && <Spinner size='sm' />}
                </Button.Ripple>
              </Col>
            </Row>
          </Form>
        </ModalBody>
      </Modal>
    </>
  )
}

export default SlaReport
