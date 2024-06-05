import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable'
import { useEffect, useState } from 'react'
import { Edit, MinusCircle, PlusCircle, RefreshCw } from 'react-feather'
import {
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  ModalHeader,
  Spinner,
  UncontrolledButtonDropdown,
  UncontrolledTooltip
} from 'reactstrap'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
import AssignMeter from '@src/views/project/coliving/module/configuration/wrapper/assignMeter'
import DeassignMeter from '@src/views/project/coliving/module/configuration/wrapper/deassignMeter'
import useJwt from '@src/auth/jwt/useJwt'
import Loader from '@src/views/project/misc/loader'
import { caseInsensitiveSort } from '@src/views/utils.js'
import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import Select from 'react-select'
import { selectThemeColors } from '@utils'
import { useLocation, useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import authLogout from '@src/auth/jwt/logoutlogic'

const AssignDeassignTable = props => {
  const [hasError, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [assignModal, setAssignModal] = useState(false)
  const [deassignModal, setDeassignModal] = useState(false)
  const [selectRow, setSelectRow] = useState({})
  const [loader, setLoader] = useState(false)
  const [retry, setRetry] = useState(false)
  const [centeredModal, setCenteredModal] = useState(false)
  const [formType, setFormType] = useState('add')
  const [consumersList, setConsumersList] = useState([])
  const [selected, setSelected] = useState(props.sites[0])
  const [syncSpinner, setSyncSpinner] = useState(false)
  const location = useLocation()
  const uri = location.pathname.split('/')

  // Logout User
  const [logout, setLogout] = useState(false)
  const dispatch = useDispatch()
  const history = useHistory()
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const getProjectsAllConsumers = async params => {
    return await useJwt
      .getProjectsAllConsumers(params)
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

  const syncAllMeters = async params => {
    return await useJwt
      .syncAllMeters(params)
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
    if (props.active === '4') {
      setCenteredModal(false)
      setError(false)
      setLoader(true)
      setConsumersList([])

      const params = {
        site: selected.value
      }
      const [statusCode, response] = await getProjectsAllConsumers(params)

      if (statusCode === 200) {
        setConsumersList(response.data.data.result)
      } else if (statusCode === 206) {
        toast.warning(<Toast msg={response.data.detail} type='warning' />, { hideProgressBar: true })
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else {
        setError(true)
      }

      setLoader(false)
    }
  }, [selected, retry, props.active])

  const retryAgain = () => setRetry(!retry)

  const tblColumn = () => {
    const column = []

    const renameColumns = {
      eb_load: 'EB load (watt)',
      dg_load: 'DG load (watt)',
      flat_area: 'Flat area (sq. ft.)'
    };

    for (const i in consumersList[0]) {
      const col_config = {}
      const ignore_columns = uri[1] === 'realestate' ? ['id', 'site', 'site_id', 'user_email', 'grid_id', 'email', 'site_name']
        : ['id', 'site', 'site_id', 'user_email', 'grid_id', 'email', 'site_name', 'dg_load', 'eb_load', 'flat_area', 'flat_no']

      if (!ignore_columns.includes(i)) {
        col_config.name = renameColumns[i] || `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
        col_config.serch = i
        col_config.sortable = true
        col_config.selector = row => row[i]
        col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)

        if (['sc_no', 'user_name'].includes(i)) {
          col_config.minWidth = '220px'
        }

        // if (['meter_ip'].includes(i)) {
        //   col_config.minWidth = '150px'
        // }

        col_config.cell = row => {
          return (
            <div className='d-flex'>
              <span className='d-block font-weight-bold'>{row[i] ? row[i] : '--'}</span>
            </div>
          )
        }
        column.push(col_config)
      }
    }

    const assignMeter = row => {
      setCenteredModal(true)

      setAssignModal(true)
      setDeassignModal(false)

      setSelectRow(row)
      setFormType('add')
    }

    const deassignMeter = row => {
      setCenteredModal(true)

      setAssignModal(false)
      setDeassignModal(true)

      setSelectRow(row)
      setFormType('delete')
    }

    const editAssignedMeter = row => {
      setCenteredModal(true)

      setAssignModal(true)
      setDeassignModal(false)

      setSelectRow(row)
      setFormType('update')
    }

    column.push({
      name: 'Action',
      maxWidth: '100px',
      minWidth: '100px',

      cell: row => {
        return !row.user_mobile || row.user_mobile === '' ? (
          <PlusCircle size='20' className='ml-1 cursor-pointer text-primary' onClick={() => assignMeter(row)} />
        ) : (
          <>
            <span>
              <UncontrolledButtonDropdown>
                <DropdownToggle color='flat' className='p-0'>
                  <MinusCircle size='20' className='ml-1 cursor-pointer text-danger' />
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem tag='a' className='text-primary' onClick={() => assignMeter(row)}>
                    Associate new user
                  </DropdownItem>
                  <DropdownItem tag='a' className='text-danger' onClick={() => deassignMeter(row)}>
                    Dissociate Meter
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledButtonDropdown>
            </span>
            <span>
              <Edit size='18' className='ml-1 cursor-pointer text-primary' onClick={() => editAssignedMeter(row)} />
            </span>
          </>
        )
      }
    })

    return column
  }

  const siteSelect = () => {
    return (
      <Select
        defaultValue={selected}
        isSearchable={true}
        theme={selectThemeColors}
        options={props.sites.length && props.sites}
        onChange={e => setSelected(e)}
        className='react-select rounded'
        classNamePrefix='select'
        placeholder='Select site ...'
      />
    )
  }

  const sync = () => {
    const forceSync = async () => {
      setSyncSpinner(true)
      const [statusCode, response] = await syncAllMeters({ site_id: `${selected.value}**${selected.label}` })

      if (statusCode === 200) {
        toast.success(<Toast msg={response.data.data.result} type='success' />, { hideProgressBar: true })
      } else if (statusCode === 206) {
        toast.warning(<Toast msg={response.data.detail} type='warning' />, { hideProgressBar: true })
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else {
        toast.warning(<Toast msg='Something went wrong' type='warning' />, { hideProgressBar: true })
      }
      setSyncSpinner(false)
      retryAgain()
    }

    return (
      <>
        {syncSpinner ? (
          <Spinner size='sm' className='mt_13 mx_7 float-right' />
        ) : (
          <RefreshCw size='18' id='sync' className='mt_13 mx_7 cursor-pointer float-right' onClick={forceSync} />
        )}
        <UncontrolledTooltip placement='top' target='sync'>
          Force load!
        </UncontrolledTooltip>
      </>
    )
  }

  return (
    <>
      {hasError ? (
        <Col lg='12' className=''>
          <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { loader } }} />
        </Col>
      ) : (
        <>
          {loader ? (
            <Loader hight='min-height-475' />
          ) : (
            // <SimpleDataTable columns={tblColumn()} rowCount={15} tblData={consumersList} tableName={props.tableName} flatPicker={siteSelect()} />
            <SimpleDataTable columns={tblColumn()} tblData={consumersList} tableName={props.tableName} flatPicker={siteSelect()} extras={sync()} />
          )}

          <Modal isOpen={centeredModal} toggle={() => setCenteredModal(!centeredModal)} className={`modal-dialog-centered`}>
            <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>
              {assignModal && <span className='m-0 h3'>Associate the meter</span>}
              {deassignModal && <span className='m-0 h3'>Dissociate meter account</span>}
            </ModalHeader>
            <ModalBody>
              {assignModal && <AssignMeter row={selectRow} type={formType} retry={retryAgain} />}
              {deassignModal && <DeassignMeter row={selectRow} retry={retryAgain} siteDetail={selected} />}
            </ModalBody>
          </Modal>
        </>
      )}
    </>
  )
}

export default AssignDeassignTable
