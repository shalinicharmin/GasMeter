import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable'
import { useEffect, useState } from 'react'
import { Check, Edit, Frown, Plus, RefreshCw, Smile, Target } from 'react-feather'
import { Badge, Col, Modal, ModalBody, ModalHeader, Spinner } from 'reactstrap'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
import useJwt from '@src/auth/jwt/useJwt'
import Loader from '@src/views/project/misc/loader'
import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import { caseInsensitiveSort } from '@src/views/utils.js'
import AllocationForm from '@src/views/project/coliving/module/configuration/wrapper/allocationForm'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import authLogout from '@src/auth/jwt/logoutlogic'

const EbDgAllocation = props => {
  const [hasError, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectRow, setSelectRow] = useState({})
  const [loader, setLoader] = useState(false)
  const [retry, setRetry] = useState(false)
  const [centeredModal, setCenteredModal] = useState(false)
  const [formType, setFormType] = useState('add')
  const [sites, setSites] = useState('')
  const [sitesList, setSitesList] = useState([])

  // Logout User
  const [logout, setLogout] = useState(false)
  const dispatch = useDispatch()
  const history = useHistory()
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const getEbDgSites = async params => {
    return await useJwt
      .getEbDgSites(params)
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

  useEffect(() => {
    const temp = {}

    for (const i of props.sites) {
      temp[`${i.label}##${i.value}`] = i.label
    }

    setSites(temp)
  }, [])

  useEffect(async () => {
    if (props.active === '1') {
      setCenteredModal(false)
      setError(false)
      setLoader(true)
      setSitesList([])

      const [statusCode, response] = await getEbDgSites({})

      if (statusCode === 200) {
        setSitesList(response.data.data.result)
      } else if (statusCode === 206) {
        toast.warning(<Toast msg={response.data.detail} type='warning' />, { hideProgressBar: true })
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else {
        setError(true)
      }

      setLoader(false)
    }
  }, [retry, props.active])

  const retryAgain = () => setRetry(!retry)

  const tblColumn = () => {
    const column = []
    const customPositions = {
      site_name: 1,
      eb_meter: 2,
      ldp_eb: 3,
      dg_meter: 4,
      ldp_dg: 5
    };

    for (const i in sitesList[0]) {
      const col_config = {}

      if (!['id', 'site_id', 'eb_dg_site', 'running_source', 'updated_by', 'timestamp', 'cmd_status'].includes(i)) {
        col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
        col_config.serch = i
        col_config.sortable = true
        col_config.reorder = true
        col_config.selector = row => row[i]
        col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)
        col_config.position = customPositions[i] || 1000;

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

    const editAssignedMeter = row => {
      setCenteredModal(true)

      setSelectRow(row)
      setFormType('update')
    }

    column.push({
      name: 'Source / CMD status',
      maxWidth: '150px',
      minWidth: '150px',

      cell: row => {
        return (
          <>
            {
              row.running_source === 'EB' ? <Badge pill color="light-success" data-tag="allowRowEvents" className="w-50"> EB </Badge>
                : row.running_source === 'DG' ? <Badge pill color="light-warning" data-tag="allowRowEvents" className="w-50"> DG </Badge>
                  : '--'
            }
            {
              row.cmd_status === 'Pending' ? <Spinner className='text-warning ml_5' size='sm' />
                : row.cmd_status === 'Executed' ? <Check className='text-success ml_5' size='18' />
                  : '--'
            }
          </>
        )
      }
    })

    column.push({
      name: 'Action',
      maxWidth: '60px',
      minWidth: '60px',

      cell: row => <Edit size='18' className='ml-1 cursor-pointer text-primary' onClick={() => editAssignedMeter(row)} />
    })


    const sortedColumns = column.sort((a, b) => {
      if (a.position < b.position) {
        return -1
      } else if (a.position > b.position) {
        return 1
      }
      return 0
    })
    return sortedColumns;
  }

  const allocateEbDg = () => {
    setCenteredModal(true)
    setFormType('add')
    setSelectRow({})
  }

  const addUi = () => {
    return <>
      <Plus size='18' className='mr_10 cursor-pointer float-right mt_12' onClick={() => allocateEbDg()} />
      <RefreshCw size='18' className='mr_10 cursor-pointer float-right mt_12' onClick={() => retryAgain()} />
    </>
  }

  return <>
    {hasError ? (
      <Col lg='12' className=''>
        <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { loader } }} />
      </Col>
    ) : (
      <>
        {loader ? <Loader hight='min-height-475' /> : <SimpleDataTable columns={tblColumn()} rowCount={15} tblData={sitesList} tableName={props.tableName} extras={addUi()} />}

        <Modal isOpen={centeredModal} toggle={() => setCenteredModal(!centeredModal)} className={`modal-dialog-centered modal-lg`}>
          <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>
            <span className='m-0 h3'>Allocate EB/DG meter to site</span>
          </ModalHeader>
          <ModalBody>
            <AllocationForm type={formType} sites={sites} selected={selectRow} retry={retryAgain} />
          </ModalBody>
        </Modal>
      </>
    )}
  </>
}

export default EbDgAllocation
