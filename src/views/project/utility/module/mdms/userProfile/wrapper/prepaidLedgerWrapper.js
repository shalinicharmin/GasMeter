import { Row, Col, Modal, ModalHeader, ModalBody, Button, InputGroup } from 'reactstrap'
import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'
import { TrendingUp } from 'react-feather'
import { useState, useEffect, Fragment } from 'react'

import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable'
// Datepicker
import Flatpickr from 'react-flatpickr'

import { useSelector, useDispatch } from 'react-redux'
import { handlePrepaidLedger } from '@store/actions/UtilityProject/MDMS/userprofile'
import useJwt from '@src/auth/jwt/useJwt'
import Loader from '@src/views/project/misc/loader'

import Toast from '@src/views/ui-elements/cards/actions/createToast'
import { toast } from 'react-toastify'

import no_data from '@src/assets/images/svg/no_data.svg'

import { useLocation, useHistory } from 'react-router-dom'
import authLogout from '../../../../../../../auth/jwt/logoutlogic'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'

const PrepaidLedgerWrapper = props => {
  const dispatch = useDispatch()
  const history = useHistory()

  // Error Handling
  const [errorMessage, setErrorMessage] = useState('')
  const [hasError, setError] = useState(false)
  const [retry, setRetry] = useState(false)

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const [centeredModal, setCenteredModal] = useState(false)
  // const [picker, setPicker] = useState(new Date())
  const [ledgerData, setLedgerData] = useState(undefined)
  const [message1, setMessage1] = useState(undefined)
  const [message2, setMessage2] = useState(undefined)

  const [fetchLedgerData, setFetchLedgerData] = useState(true)

  const [startDateTime, setStartDateTime] = useState(undefined)
  const [endDateTime, setEndDateTime] = useState(undefined)
  const [page, setpage] = useState(0)
  // const dispatch = useDispatch()

  const HierarchyProgress = useSelector(state => state.UtilityMDMSHierarchyProgressReducer.responseData)
  let user_name = ''
  let meter_serial = ''
  if (HierarchyProgress && HierarchyProgress.user_name) {
    user_name = HierarchyProgress.user_name
    meter_serial = HierarchyProgress.meter_serial_number
  }

  const fetchData = async params => {
    return await useJwt
      .getConsumerPrepaidLedgerMdmsModule(params)
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

  useEffect(async () => {
    if (fetchLedgerData || retry) {
      // console.log('Fetching Data through API ....')

      let params = undefined

      if (endDateTime) {
        params = {
          project: props.project,
          start_datetime: startDateTime,
          end_datetime: endDateTime,
          sc_no: HierarchyProgress.user_name
        }
      } else {
        params = {
          project: props.project,
          sc_no: HierarchyProgress.user_name
        }
      }
      const [statusCode, response] = await fetchData(params)

      if (statusCode === 200) {
        try {
          setFetchLedgerData(false)
          // dispatch(handlePrepaidLedger(response.data.data.result.stat))

          // console.log('Ledger Data ............')
          // console.log(ledgerData)

          setLedgerData(response.data.data.result.stat)

          if ('message1' in response.data.data.result && response.data.data.result.message1.length > 0) {
            setMessage1(response.data.data.result.message1)
          }

          if ('message2' in response.data.data.result && response.data.data.result.message2.length > 0) {
            setMessage2(response.data.data.result.message2)
          }
          setRetry(false)
        } catch (error) {
          setRetry(false)
          setError(true)
          setErrorMessage('Something went wrong, please retry')
        }
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else {
        setRetry(false)
        setError(true)
        setErrorMessage('Network Error, please retry')
      }
    }
  }, [fetchLedgerData, retry])

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

  const tblColumn = statehandler => {
    const column = []

    if (ledgerData) {
      for (const i in ledgerData[0]) {
        const col_config = {}
        if (
          i !== 'id' &&
          i !== 'consumer_category' &&
          i !== 'contracted_demand' &&
          i !== 'contracted_demand_unit' &&
          i !== 'serial_no' &&
          i !== 'meter_owner' &&
          i !== 'debit_demand_charge' &&
          i !== 'debit_meter_rent'
        ) {
          col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
          col_config.id = `${i.charAt(0).toUpperCase()}${i.slice(1)}`
          col_config.serch = i
          col_config.sortable = true
          col_config.selector = row => row[i]
          col_config.style = {
            minHeight: '40px',
            maxHeight: '40px'
          }
          col_config.width = '100px'

          if ((i === 'billing_start_datetime') | (i === 'tariff_slabs_used')) {
            col_config.width = '200px'
          }

          col_config.cell = row => {
            return (
              <div className='d-flex'>
                <span
                  className='d-block font-weight-bold text-truncate cursor-pointer'
                  title={row[i] ? (row[i] !== '' ? (row[i].toString().length > 30 ? row[i] : '') : '-') : '-'}>
                  {row[i] && row[i] !== '' ? row[i].toString().substring(0, 30) : '-'}
                  {row[i] && row[i] !== '' ? (row[i].toString().length > 30 ? '...' : '') : '-'}
                </span>
              </div>
            )
          }
          column.push(col_config)
        }
      }
    }
    column.unshift({
      name: 'Sr',
      width: '90px',
      cell: (row, i) => {
        return <div className='d-flex  justify-content-center'>{page * 10 + 1 + i}</div>
      }
    })

    return column
  }

  const closeModal = () => {
    setStartDateTime(undefined)
    setEndDateTime(undefined)
    setFetchLedgerData(true)
    setCenteredModal(!centeredModal)
  }

  const onDateRangeSelected = dateRange => {
    if (dateRange.length === 1) {
      setStartDateTime(dateTimeFormat(dateRange[0]))
      setEndDateTime(undefined)
    } else if (dateRange.length === 2) {
      setStartDateTime(dateTimeFormat(dateRange[0]))
      setEndDateTime(dateTimeFormat(dateRange[1]))
    }
  }

  const onDateRangeSelectedButtonPressed = () => {
    if (startDateTime && endDateTime) {
      setFetchLedgerData(true)
      setLedgerData(undefined)
    } else {
      toast.error(<Toast msg='Invalid DateTime Range' type='danger' />, { hideProgressBar: true })
    }
  }

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }
  return (
    <>
      <StatsHorizontal
        icon={<TrendingUp size={21} />}
        color='info'
        stats='Prepaid ledger'
        statTitle=''
        click={() => setCenteredModal(!centeredModal)}
        clas='h4'
      />
      <Modal isOpen={centeredModal} toggle={() => closeModal()} className='modal-dialog-centered modal_size'>
        <ModalHeader toggle={() => closeModal()}>Prepaid ledger</ModalHeader>
        <ModalBody>
          {ledgerData && (
            <Col>
              <Row className='justify-content-end mb-1'>
                <Col lg='3' xs='6' className='px_5 ledger_hover mt_5'>
                  <div style={{ boxShadow: '1px 1px 5px 1px #ccc', borderRadius: '5px' }} className='py_3 px-1 bg-img-top-sm'>
                    <p className='m-0 font-weight-bolder'>{ledgerData.length > 0 ? ledgerData[0]['consumer_category'] : 'NA'}</p>
                    <small className='m-0'>Consumer Category</small>
                  </div>
                </Col>
                {/* <Col className='px_5 ledger_hover mt_5' >
                  <div style={{ boxShadow: '1px 1px 5px 1px #ccc', borderRadius: '5px' }} className='px-1 py_3 bg-img-top-sm'>
                    <p className='m-0 font-weight-bolder'>
                      {' '}
                      {ledgerData.length > 0 ? ledgerData[0]['contracted_demand'] : ''}{' '}
                      {ledgerData.length > 0 ? ledgerData[0]['contracted_demand_unit'] : 'NA'}{' '}
                    </p>
                    <small className='m-0'>Contracted Demand</small>
                  </div>
                </Col> */}
                <Col lg='3' xs='6' className='px_5 ledger_hover mt_5'>
                  <div style={{ boxShadow: '1px 1px 5px 1px #ccc', borderRadius: '5px' }} className='px-1 py_3 bg-img-top-sm'>
                    <p className='m-0 font-weight-bolder'>{ledgerData.length > 0 ? `₹ ${ledgerData[0]['debit_demand_charge']}` : 'NA'}</p>
                    <small className='m-0'>Debit Demand Charges</small>
                  </div>
                </Col>
                <Col lg='3' xs='6' className='px_5 ledger_hover mt_5'>
                  <div style={{ boxShadow: '1px 1px 5px 1px #ccc', borderRadius: '5px' }} className='px-1 py_3 bg-img-top-sm'>
                    <p className='m-0 font-weight-bolder'>{ledgerData.length > 0 ? `₹ ${ledgerData[0]['debit_meter_rent']}` : 'NA'}</p>
                    <small className='m-0'>Debit Meter Rent</small>
                  </div>
                </Col>
                <Col lg='3' xs='6' className='mt_10 px_5'>
                  <InputGroup>
                    <Flatpickr
                      placeholder='Select date range ...'
                      onChange={onDateRangeSelected}
                      className='form-control'
                      options={{ mode: 'range', enableTime: true }}
                    />
                    <Button color='primary' outline onClick={onDateRangeSelectedButtonPressed}>
                      Go
                    </Button>
                  </InputGroup>
                </Col>
              </Row>
              {message1 && <Row className='justify-content-left mb-1'>{message1 && <h6 style={{ color: 'red' }}>{message1}</h6>}</Row>}
              {message2 && <Row className='justify-content-left mb-1'>{message2 && <h6 style={{ color: 'red' }}>{message2}</h6>}</Row>}
            </Col>
          )}

          <>
            {hasError ? (
              <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
            ) : (
              <>
                {ledgerData && (
                  <SimpleDataTable
                    columns={tblColumn('as')}
                    tblData={ledgerData}
                    currentpage={page}
                    ispagination
                    selectedPage={setpage}
                    rowCount={10}
                    tableName={'Consumer Prepaid ledger'.concat('(', meter_serial, ')')}
                    defaultSortFieldId={'Billing_start_datetime'}
                  />
                )}
                {!ledgerData && <Loader hight='min-height-475' />}
              </>
            )}
          </>
        </ModalBody>
      </Modal>
    </>
  )
}

export default PrepaidLedgerWrapper
