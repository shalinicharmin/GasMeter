import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable'
import { useEffect, useState } from 'react'
import { Edit, Edit2, Eye, Plus, RefreshCw } from 'react-feather'
import { Col, Modal, ModalBody, ModalHeader, UncontrolledTooltip } from 'reactstrap'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
import Select from 'react-select'
import { selectThemeColors } from '@utils'
import useJwt from '@src/auth/jwt/useJwt'
import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import Loader from '@src/views/project/misc/loader'
import TariffForm from '@src/views/project/coliving/module/configuration/wrapper/tariffForm'
import { caseInsensitiveSort } from '@src/views/utils.js'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import authLogout from '@src/auth/jwt/logoutlogic'

const TariffTable = props => {
  const [hasError, setError] = useState(false)
  const [loader, setLoader] = useState(undefined)
  const [retry, setRetry] = useState(false)
  const [centeredModal, setCenteredModal] = useState(false)
  const [selected, setSelected] = useState(props.sites[0])
  const [consumersList, setConsumersList] = useState([])
  const [selectedRows, setSelectedRows] = useState('')
  const [viewRow, setViewRow] = useState('')
  const [addUpdateUi, setAddUpdateUi] = useState('')
  const [toggledClearRows, setToggleClearRows] = useState(false)
  const [formType, setFormType] = useState('save')

  // Logout User
  const [logout, setLogout] = useState(false)
  const dispatch = useDispatch()
  const history = useHistory()
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const getAllTatiffMeter = async params => {
    return await useJwt
      .getAllTatiffMeter(params)
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
    if (props.active === '2') {
      setError(false)
      setLoader(true)
      setCenteredModal(false)
      setSelectedRows('')
      setToggleClearRows(!toggledClearRows)
      setConsumersList([])

      const params = { site: selected.value }
      const [statusCode, response] = await getAllTatiffMeter(params)

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
      eb_price: 'EB price (paise)',
      dg_price: 'DG price (paise)'
    };

    for (const i in consumersList[0]) {
      const col_config = {}

      if (!['id', 'site_id', 'grid_id', 'meter_version', 'eb_full_tariff', 'dg_full_tariff', 'disable'].includes(i)) {
        col_config.name = renameColumns[i] || `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
        col_config.serch = i
        col_config.sortable = true
        col_config.selector = row => row[i]
        col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)

        col_config.cell = row => {
          return (
            <div className='d-flex'>
              <span className='d-block font-weight-bold'>{row[i]}</span>
            </div>
          )
        }
        column.push(col_config)
      }
    }

    const viewTariff = async row => {
      setFormType('view')
      setCenteredModal(true)
      setViewRow(row)
    }

    column.push({
      name: 'Config status',
      sortable: true,

      cell: row => {
        return <>
          {
            row.status !== '-' ? <div className='d-flex'><span className='d-block font-weight-bold'>Configured</span></div>
              : <div className='d-flex'><span className='d-block font-weight-bold'>Un-configured</span></div>
          }
        </>
      }
    })

    column.push({
      name: 'View',

      cell: row => {
        return <>
          {row.status !== '-' && <Eye size='15' className='cursor-pointer text-danger' onClick={() => viewTariff(row)} />}
        </>
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

  useEffect(() => {
    if (selectedRows.length) {
      const toggleTariff = () => {
        setFormType('save');

        selectedRows[0].length
          ? setCenteredModal(true)
          : toast.warning(<Toast msg={'Please select atlease one consumer.'} type='warning' />, { hideProgressBar: true })
      }

      setAddUpdateUi(
        selectedRows[1].includes('update') && selectedRows[1].includes('add') ? (
          <>
            <div id='add_update' className='cursor-pointer float-right mt_10' onClick={() => toggleTariff()}>
              <Plus size={15} className='ml_5' />
              <Edit2 size={15} />
            </div>
            <UncontrolledTooltip placement='top' target='add_update'>
              Add and update tariff
            </UncontrolledTooltip>
          </>
        ) : selectedRows[1].includes('update') ? (
          <>
            <Edit size={15} id='_edit' className='mt_14 float-right cursor-pointer mx_5' onClick={() => toggleTariff()} />
            <UncontrolledTooltip placement='top' target='_edit'>
              Edit tariff
            </UncontrolledTooltip>
          </>
        ) : selectedRows[1].includes('add') ? (
          <>
            <Plus size={15} id='_add' className='mt_14 float-right cursor-pointer mx_5' onClick={() => toggleTariff()} />
            <UncontrolledTooltip placement='top' target='_add'>
              Initiate tariff
            </UncontrolledTooltip>
          </>
        ) : (
          ''
        )
      )
    } else setAddUpdateUi('')
  }, [selectedRows])

  const onSelectedRowsChange = rows => {
    const args = []

    setViewRow(rows.selectedRows[0])
    setFormType('save')

    for (const i of rows.selectedRows) (i.eb_price === '-' && i.dg_price === '-') ? args[0] = 'add' : args[1] = 'update'

    setSelectedRows([rows.selectedRows, args])
  }

  const rowDisabledCriteria = row => row.disable;

  const extraFeature = () => {
    return <>
      <>
        <RefreshCw size={15} id='refersh' className='mt_14 float-right cursor-pointer mx_5' onClick={retryAgain} />
        <UncontrolledTooltip placement='top' target='refersh'>
          Refresh table
        </UncontrolledTooltip>
      </>
      {addUpdateUi}
    </>
  }

  return (
    <>
      {hasError ? (
        <Col lg='12' className=''>
          <CardInfo props={{ message: '', retryFun: { retryAgain }, retry: { loader } }} />
        </Col>
      ) : loader ? (
        <Loader hight='min-height-475' />
      ) : (
        <>
          <SimpleDataTable
            columns={tblColumn()}
            rowCount={15}
            tblData={consumersList}
            selectable={true}
            extras={extraFeature()}
            tableName={props.tableName}
            onSelectedRowsChange={onSelectedRowsChange}
            flatPicker={siteSelect()}
            toggledClearRows={toggledClearRows}
            rowDisabled={rowDisabledCriteria}
          />

          <Modal isOpen={centeredModal} toggle={() => setCenteredModal(!centeredModal)} className={`modal-dialog-centered modal_size`}>
            <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>
              {
                selectedRows ? selectedRows[1].includes('update') && selectedRows[1].includes('add') ? 'Add and Update Tariff' :
                  selectedRows[1].includes('update') ? 'Update Tariff' :
                    'Add Tariff' : 'View Tariff'
              }
            </ModalHeader>
            <ModalBody>
              <TariffForm row={selectedRows} site={selected} retry={retryAgain} viewRow={viewRow} type={formType} />
            </ModalBody>
          </Modal>
        </>
      )}
    </>
  )
}

export default TariffTable
