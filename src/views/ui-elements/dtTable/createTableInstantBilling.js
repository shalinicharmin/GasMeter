import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable'
import { Eye, FileText } from 'react-feather'
import useJwt from '@src/auth/jwt/useJwt'
import { toXML } from 'jstoxml'
import XMLViewer from 'react-xml-viewer'
import { Modal, ModalHeader, ModalBody } from 'reactstrap'

// import { useSelector } from 'react-redux'

import { useState, useEffect } from 'react'
import Loader from '@src/views/project/misc/loader'

import BillDetermineActionModal from '@src/views/project/utility/module/mdms/userProfile/wrapper/billDetermineActionModal'

import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'
import authLogout from '../../../auth/jwt/logoutlogic'

const CreateTableInstantBilling = props => {
  const [centeredModal, setCenteredModal] = useState(false)
  const [eventHistoryStartTime, setEventHistoryStartTime] = useState(undefined)
  const [eventHistoryEndTime, setEventHistoryEndTime] = useState(undefined)
  const [xmlModal, setXmlModal] = useState(false)
  const [rawXml, setRawXml] = useState('')

  const dispatch = useDispatch()
  const history = useHistory()

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  //   console.log('Table Data for Billing History ...')
  //   console.log(props.data)

  //   Sorted Data in Descending order
  const sorted_events = props.data.sort(function (a, b) {
    const date_a = new Date(a.billing_datetime)
    const date_b = new Date(b.billing_datetime)
    return date_b - date_a
  })

console.log(sorted_events, "sorted Events")


  for (let i = 0; i < sorted_events.length; i++) {
    sorted_events[i]['billing_end_time'] = sorted_events[i]['billing_datetime']
    if (i === sorted_events.length - 1) {
      //Create DateTime Object
      const temp_date = new Date(sorted_events[i]['billing_datetime'])
      temp_date.setHours(0)
      temp_date.setMinutes(0)
      temp_date.setSeconds(0)
      temp_date.setDate(1)
      sorted_events[i]['billing_start_time'] = temp_date.toISOString().split('T')[0].concat(' ', '23:59:59')
    } else {
      sorted_events[i]['billing_start_time'] = sorted_events[i + 1]['billing_datetime']
    }
  }

  // console.log('Sorted Data ....')
  // console.log(sorted_events)

  const fetchHistoryData = async params => {
    return await useJwt
      .getPullBasedTamperEvent(params)
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

  const fetchRechargeData = async params => {
    return await useJwt
      .getMeterRecharge(params)
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

  const tblColumn = statehandler => {
    const column = []

    for (const i in sorted_events[0]) {
      const col_config = {}
      if (i !== 'id') {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
        col_config.id = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
        col_config.serch = i
        col_config.selector = row => row[i]
        col_config.sortable = true
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

    const showData = async row => {
      // console.log(row)
      // console.log('Row Clicked .....')
      //   setEventHistoryStartTime(row['from_datetime'])
      //   setEventHistoryEndTime(row['to_datetime'])

      //   setCenteredModal(true)

      setEventHistoryStartTime(row['billing_start_time'])
      setEventHistoryEndTime(row['billing_end_time'])

      setCenteredModal(true)
    }

    const showRaw = async row => {
      const row_data = { data: {} }
      const params = {
        page: '1',
        meter: row.meter_number,
        project: 'ipcl',
        start_date: row.billing_start_time,
        end_date: row.billing_end_time,
        tamperd: '1'
      }
      const data = undefined
      const rechargeParams = undefined

      const [statusCode, response] = await fetchHistoryData(params)

      if (statusCode) {
        if (statusCode === 401 || statusCode === 403) {
          setLogout(true)
        } else {
          data = response.data.data.result.results

          rechargeParams = {
            start_date: row.billing_start_time,
            end_date: row.billing_end_time,
            poject: 'ipcl',
            sc_no: row.meter_number
          }
        }
      }

      const [status, resp] = await fetchRechargeData(rechargeParams)
      if (status) {
        if (status === 401 || status === 403) {
          setLogout(true)
        } else {
          const recharge_data = resp.data.data.result.stat

          row_data['data'] = { ...row }
          row_data['data']['pull_data'] = data.pull_data
          row_data['data']['push_data'] = data.push_data
          row_data['data']['recharge_data'] = recharge_data

          const config = {
            header: true,
            indent: '    '
          }

          const xmlData = toXML(row_data, config)

          setRawXml(xmlData)
          setXmlModal(true)
        }
      }
    }

    column.push({
      name: 'Tamper Events',
      maxWidth: '100px',
      style: {
        minHeight: '40px',
        maxHeight: '40px'
      },
      cell: row => {
        return (
          <>
            <Eye size='20' className='ml-1 cursor-pointer' onClick={() => showData(row)} />
            <span title='Show RAW XML'>
              <FileText size='20' className='ml-1 cursor-pointer' onClick={() => showRaw(row)} />
            </span>
          </>
        )
      }
    })
    return column
  }

  const sorted_events_final = []
  if (sorted_events.length === 1) {
    sorted_events_final.push(sorted_events[0])
  } else {
    sorted_events_final.push(sorted_events[0])
    sorted_events_final.push(sorted_events[1])
  }

  return (
    <div>
      <SimpleDataTable
        columns={tblColumn('as')}
        tblData={sorted_events_final}
        height={props.height ? props.height : ''}
        rowCount={props.rowCount ? props.rowCount : 8}
        tableName={props.tableName}
        refresh={props.refresh && props.refresh}
        extras={props.extras}
        smHeading={props.smHeading}
        defaultSortFieldId={'Billing datetime'} //ID based on which data will be sorted
      />
      {/* Show All the events for Billing determinants generated for time interval */}
      {centeredModal && (
        <BillDetermineActionModal
          isOpen={centeredModal}
          handleModal={setCenteredModal}
          eventHistoryStartTime={eventHistoryStartTime}
          eventHistoryEndTime={eventHistoryEndTime}
          txtLen={50}
        />
      )}

      <Modal isOpen={xmlModal} toggle={() => setXmlModal(!xmlModal)} scrollable className='modal-lg'>
        <ModalHeader toggle={() => setXmlModal(!xmlModal)}>Raw XML of the data</ModalHeader>
        <ModalBody>
          <XMLViewer xml={rawXml} />
        </ModalBody>
      </Modal>
    </div>
  )
}

export default CreateTableInstantBilling
