import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable'
import { useEffect, useState } from 'react'
import { Edit, Plus } from 'react-feather'
import { Col, Modal, ModalBody, ModalHeader } from 'reactstrap'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
import useJwt from '@src/auth/jwt/useJwt'
import Loader from '@src/views/project/misc/loader'
import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import { caseInsensitiveSort } from '@src/views/utils.js'
import MiscBillForm from '@src/views/project/coliving/module/configuration/wrapper/miscellaneousForm'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import authLogout from '@src/auth/jwt/logoutlogic'

const MiscellaneousServices = props => {
    const [hasError, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [selectRow, setSelectRow] = useState({})
    const [loader, setLoader] = useState(false)
    const [retry, setRetry] = useState(false)
    const [centeredModal, setCenteredModal] = useState(false)
    const [formType, setFormType] = useState('')
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

    const getConfiguredTowers = async params => {
        return await useJwt
            .getConfiguredTowers(params)
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
        if (props.active === '6') {
            setCenteredModal(false)
            setError(false)
            setLoader(true)
            setSitesList([])

            let sites = ''

            for (const i of props.sites) sites += `${i.value},`

            const params = { sites: sites.slice(0, -1) }
            const [statusCode, response] = await getConfiguredTowers(params)

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

        for (const i in sitesList[0]) {
            const col_config = {}

            if (['site_name', 'name', 'email', 'created_date'].includes(i)) {
                col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
                col_config.serch = i
                col_config.sortable = true
                col_config.selector = row => row[i]
                col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)

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

        const editTowerConfiguration = row => {
            setCenteredModal(true)

            setSelectRow(row)
            setFormType('update')
        }

        column.push({
            name: 'Action',
            maxWidth: '100px',
            minWidth: '100px',

            cell: row => <Edit size='18' className='ml-1 cursor-pointer text-primary' onClick={() => editTowerConfiguration(row)} />
        })

        return column
    }

    const addMisc = () => {
        setCenteredModal(true)
        setSelectRow({})
        setFormType('add')
    }

    const addUi = () => <Plus size='18' className='mr_10 cursor-pointer float-right mt_12' onClick={() => addMisc()} />

    return <>
        {hasError ? (
            <Col lg='12' className=''>
                <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { loader } }} />
            </Col>
        ) : (
            <>
                {loader ? <Loader hight='min-height-475' /> : <SimpleDataTable columns={tblColumn()} tblData={sitesList} tableName={props.tableName} extras={addUi()} />}

                <Modal isOpen={centeredModal} toggle={() => setCenteredModal(!centeredModal)} className={`modal-dialog-centered modal-lg`}>
                    <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>
                        <span className='m-0 h3'>Create miscellaneous bill</span>
                    </ModalHeader>
                    <ModalBody>
                        <MiscBillForm type={formType} selected={selectRow} sites={sites} retry={retryAgain} />
                    </ModalBody>
                </Modal>
            </>
        )}
    </>
}

export default MiscellaneousServices
