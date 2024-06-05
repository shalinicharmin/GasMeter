import Loader from '@src/views/project/misc/loader'
import CreateTable from '@src/views/ui-elements/dtTable/createTable'
import SimpleDataTablePaginated from '@src/views/ui-elements/dtTable/simpleTablePaginated'
import { Tooltip } from 'reactstrap'
import { FileText } from 'react-feather'
import { Fragment, useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import { caseInsensitiveSort } from '@src/views/utils.js'

import useJwt from '@src/auth/jwt/useJwt'

import { useSelector, useDispatch } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'
import authLogout from '../../../../../../../auth/jwt/logoutlogic'

const InstantBillDetermineModal = props => {
  const dispatch = useDispatch()
  const history = useHistory()

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const [refresh, setRefrest] = useState(true)
  const [billTooltipOpen, setBillTooltipOpen] = useState(false)

  const [fetchingData, setFetchingData] = useState(true)
  const [response, setResponse] = useState([])
  const [totalCount, setTotalCount] = useState(120)
  const [currentPage, setCurrentPage] = useState(1)

  const [getInstantBilling, setGetInstantBilling] = useState(false)

  const selected_month = useSelector(state => state.calendarReducer.month)
  const HierarchyProgress = useSelector(state => state.UtilityMDMSHierarchyProgressReducer.responseData)

  const fetchData = async params => {
    return await useJwt
      .getMDMSUserInstantBillingDeterminantHistory(params)
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

  const executeCommand = async params => {
    return await useJwt
      .postMdasDlmsCommandExecution(params)
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
    if (fetchingData) {
      const params = {
        project: HierarchyProgress.project_name,
        meter: HierarchyProgress.meter_serial,
        page: currentPage,
        asset_type: 'meter',
        command: 'BILLING',
        page_size: 8
      }

      const [statusCode, response] = await fetchData(params)
      if (statusCode) {
        if (statusCode === 200) {
          setResponse(response.data.data.result.results)
          setFetchingData(false)
          setTotalCount(response.data.data.result.count)
        } else if (statusCode === 401 || statusCode === 403) {
          setLogout(true)
        }
      }
    }
  }, [fetchingData])

  const tblColumn = () => {
    const column = []

    for (const i in response[0]) {
      const col_config = {}
      if (i !== 'id') {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
        col_config.serch = i
        col_config.sortable = true
        col_config.selector = row => row[i]
        col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)
        // col_config.minWidth = get_length ? '200px' : '125px'
        // col_config.maxWidth = get_length ? '200px' : '125px'
        // col_config.maxWidth = i === 'feeder' ? '100px' : ''
        col_config.style = {
          minHeight: '40px',
          maxHeight: '40px'
        }
        col_config.cell = row => {
          return (
            <div className='d-flex'>
              <span
                className='d-block font-weight-bold text-truncate'
                title={row[i] ? (row[i] !== '' ? (row[i].toString().length > 10 ? row[i] : '') : '-') : '-'}>
                {row[i] && row[i] !== '' ? row[i].toString().substring(0, 10) : '-'}
                {row[i] && row[i] !== '' ? (row[i].toString().length > 10 ? '...' : '') : '-'}
              </span>
            </div>
          )
        }
        column.push(col_config)
      }
    }
    return column
  }

  const onNextPageClicked = number => {
    setCurrentPage(number + 1)
    setFetchingData(true)
  }

  const reloadData = () => {
    setCurrentPage(1)
    setFetchingData(true)
  }

  // Go to the API and get all user using props.id

  useEffect(async () => {
    if (getInstantBilling) {
      const params = {
        data: [
          {
            name: 'meter',
            value: {
              pss_name: '',
              pss_id: HierarchyProgress.pss_name,
              feeder_id: HierarchyProgress.feeder_name,
              feeder_name: '',
              site_id: HierarchyProgress.dtr_name,
              protocol: 'DLMS',
              meter_serial: HierarchyProgress.meter_serial_number,
              meter_address: '',
              sc_no: HierarchyProgress.user_name,
              project: HierarchyProgress.project_name,
              grid_id: '',
              site_name: '',
              meter_sw_version: 'NA'
            },
            command: '',
            args: {
              value: {
                from: 0,
                to: 1
              },
              input_type: 'number',
              mode: 'range'
            }
          }
        ]
      }
      const [statusCode, response] = await executeCommand(params)
      if (statusCode === 201) {
        toast.success(<Toast msg='Command sent to meter successfully.' type='success' />, { hideProgressBar: true })

        setCurrentPage(1)
        setFetchingData(true)
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else {
        if (typeof response === 'string') {
          toast.error(<Toast msg={response} type='danger' />, { hideProgressBar: true })
        } else {
          toast.error(<Toast msg='Command sent to meter failed.' type='danger' />, { hideProgressBar: true })
        }
      }
    }
  }, [getInstantBilling])

  const getInstantBillingDeterminant = () => {
    // alert('Hello')
    setGetInstantBilling(true)
  }

  const generateBill = (
    <Fragment>
      <FileText size='14' className='float-right cursor-pointer mt_9 mr_10' id='generate_bill' onClick={getInstantBillingDeterminant} />
      <Tooltip placement='top' isOpen={billTooltipOpen} target='generate_bill' toggle={() => setBillTooltipOpen(!billTooltipOpen)}>
        Generate bill !
      </Tooltip>
    </Fragment>
  )

  return (
    <div>
      {fetchingData && <Loader hight='min-height-484' />}
      {!fetchingData && (
        <SimpleDataTablePaginated
          columns={tblColumn()}
          tblData={response}
          rowCount={8}
          tableName={'Periodic Block Load'}
          refresh={reloadData}
          currentPage={currentPage}
          totalCount={totalCount}
          onNextPageClicked={onNextPageClicked}
          extras={generateBill}
        />
      )}

      {/* <CreateTable data={data} height='max' rowCount={6} tableName={props.title} refresh={setRefrest} extras={generateBill} /> */}
    </div>
  )
}

export default InstantBillDetermineModal
