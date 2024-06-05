import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable'
import { useEffect, useState } from 'react'
import { Edit, Plus, Trash } from 'react-feather'
import { Col, Modal, ModalBody, ModalHeader } from 'reactstrap'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
import DeductionForm from '@src/views/project/coliving/module/configuration/wrapper/deductionForm'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Select from 'react-select'
import { selectThemeColors } from '@utils'
import useJwt from '@src/auth/jwt/useJwt'
import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import Loader from '@src/views/project/misc/loader'
import { caseInsensitiveSort } from '@src/views/utils.js'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import authLogout from '@src/auth/jwt/logoutlogic'

const MySwal = withReactContent(Swal)

const DailyDeduction = props => {
  const [hasError, setError] = useState(false)
  const [loader, setLoader] = useState(undefined)
  const [retry, setRetry] = useState(false)
  const [centeredModal, setCenteredModal] = useState(false)
  const [selected, setSelected] = useState(props.sites[0])
  const [consumersList, setConsumersList] = useState([])
  const [selectedRows, setSelectedRows] = useState('')
  const [deductionUi, setDeductionUi] = useState('')
  const [toggledClearRows, setToggleClearRows] = useState(false)

  // Logout User
  const [logout, setLogout] = useState(false)
  const dispatch = useDispatch()
  const history = useHistory()
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const getAllDeduction = async params => {
    return await useJwt
      .getAllDeduction(params)
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

  const deleteDeduction = async params => {
    return await useJwt
      .deleteDeduction(params)
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
    if (props.active === '5') {
      setError(false)
      setLoader(true)
      setCenteredModal(false)
      setSelectedRows('')
      setToggleClearRows(!toggledClearRows)
      setConsumersList([])

      const params = { site: selected.value }
      const [statusCode, response] = await getAllDeduction(params)

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

    for (const i in consumersList[0]) {
      const col_config = {}

      if (!['id'].includes(i)) {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
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

    const delDeduction = async row => {
      MySwal.fire({
        text: `You can't revert back this data.`,
        title: 'Are you sure !',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-outline-danger ml-1'
        },
        buttonsStyling: false
      }).then(async result => {
        if (result.isConfirmed) {
          const params = { id: row.id }
          const [statusCode, response] = await deleteDeduction(params)

          if (statusCode === 200) {
            MySwal.fire({
              icon: 'success',
              title: 'Success!',
              text: response.data.data.result,
              customClass: {
                confirmButton: 'btn btn-success'
              }
            })
            retryAgain()
          } else if (statusCode === 206) {
            toast.warning(<Toast msg={response.data.detail} type='warning' />, { hideProgressBar: true })
          } else if (statusCode === 401 || statusCode === 403) {
            setLogout(true)
          } else {
            toast.error(<Toast msg={'Something went wrong.'} type='error' />, { hideProgressBar: true })
          }
        }
      })
    }

    column.push({
      name: 'Action',

      cell: row => {
        return <>{row.amount !== '-' && <Trash size='15' className='cursor-pointer text-danger' onClick={() => delDeduction(row)} />}</>
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
      const deduction = () => {
        selectedRows[0].length
          ? setCenteredModal(true)
          : toast.warning(<Toast msg={'Please select atlease one consumer.'} type='warning' />, { hideProgressBar: true })
      }

      setDeductionUi(
        selectedRows[1].includes('update') && selectedRows[1].includes('add') ? (
          <div id='addDeduction' className='cursor-pointer float-right mt_10' onClick={() => deduction()}>
            <Plus size={20} className='mx_5' />
            <Edit size={20} className='mx_5' />
          </div>
        ) : selectedRows[1].includes('update') ? (
          <>
            <Edit size={20} id='addDeduction' className='mt_10 float-right cursor-pointer mx_5' onClick={() => deduction()} />
          </>
        ) : selectedRows[1].includes('add') ? (
          <Plus size={20} id='addDeduction' className='mt_10 float-right cursor-pointer mx_5' onClick={() => deduction()} />
        ) : (
          ''
        )
      )
    } else setDeductionUi('')
  }, [selectedRows])

  const onSelectedRowsChange = rows => {
    const args = []

    for (const i of rows.selectedRows) i.amount === '-' ? (args[0] = 'add') : (args[1] = 'update')

    setSelectedRows([rows.selectedRows, args, selected])
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
            extras={deductionUi}
            tableName={props.tableName}
            onSelectedRowsChange={onSelectedRowsChange}
            flatPicker={siteSelect()}
            toggledClearRows={toggledClearRows}
          />

          <Modal isOpen={centeredModal} toggle={() => setCenteredModal(!centeredModal)} className={`modal-dialog-centered`}>
            <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>
              {selectedRows
                ? selectedRows[1].includes('update') && selectedRows[1].includes('add')
                  ? 'Add and Update daily deduction'
                  : selectedRows[1].includes('update')
                    ? 'Update daily deduction'
                    : 'Add daily deduction'
                : ''}
            </ModalHeader>
            <ModalBody>
              <DeductionForm row={selectedRows} retry={retryAgain} />
            </ModalBody>
          </Modal>
        </>
      )}
    </>
  )
}

export default DailyDeduction
