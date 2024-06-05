import SimpleDataTable from '@src/views/ui-elements/dtTable/simpleTable'
import { useEffect, useState } from 'react'
import { CheckSquare, Edit, Plus } from 'react-feather'
import { Col, Modal, ModalBody, ModalHeader } from 'reactstrap'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
import useJwt from '@src/auth/jwt/useJwt'
import Loader from '@src/views/project/misc/loader'
import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import { caseInsensitiveSort } from '@src/views/utils.js'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import authLogout from '@src/auth/jwt/logoutlogic'
import Select from 'react-select'
import { selectThemeColors } from '@utils'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import VariableCamForm from '@src/views/project/coliving/module/configuration/wrapper/variableCamForm'

const VariableCam = props => {
    const [hasError, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [selectRow, setSelectRow] = useState({})
    const [centeredModal, setCenteredModal] = useState(false)
    const [selected, setSelected] = useState()
    const [loader, setLoader] = useState(false)
    const [retry, setRetry] = useState(false)
    const [sites, setSites] = useState('')
    const [formType, setFormType] = useState('')
    const [sitesList, setSitesList] = useState([])
    const MySwal = withReactContent(Swal)

    // Logout User
    const [logout, setLogout] = useState(false)
    const dispatch = useDispatch()
    const history = useHistory()
    useEffect(() => {
        if (logout) {
            authLogout(history, dispatch)
        }
    }, [logout])

    const getConfigUnconfigCamMeters = async params => {
        return await useJwt
            .getConfigUnconfigCamMeters(params)
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
    const getCamEnabledSites = async params => {
        return await useJwt
            .getCamEnabledSites(params)
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
        // Get all variabl cam enabled sites
        const [statusCode, response] = await getCamEnabledSites({})

        if (statusCode === 200) {
            setSites(response.data.data.result)
            setSelected(response.data.data.result[0])
        } else if (statusCode === 206) {
            toast.warning(<Toast msg={response.data.detail} type='warning' />, { hideProgressBar: true })
        } else if (statusCode === 401 || statusCode === 403) {
            setLogout(true)
        } else {
            setError(true)
        }
    }, [])

    useEffect(async () => {
        if (props.active === '6') {
            setError(false)
            setLoader(true)
            setCenteredModal(false)
            setSitesList([])

            if (!sites.length && !selected) {
                return false
            }

            // Get all configured/unconfigured variable CAM meters list
            const [statusCode, response] = await getConfigUnconfigCamMeters({ site_id: selected.value })

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
    }, [retry, selected, props.active])

    const retryAgain = () => setRetry(!retry)

    const tblColumn = () => {
        const column = []

        for (const i in sitesList[0]) {
            const col_config = {}
            const ignore_columns = ['id', 'site_id', 'project']

            if (!ignore_columns.includes(i)) {
                col_config.name = `${i.charAt(0).toUpperCase()}${i.slice(1)}`.replaceAll('_', ' ')
                col_config.serch = i
                col_config.sortable = true
                col_config.selector = row => row[i]
                col_config.sortFunction = (rowA, rowB) => caseInsensitiveSort(rowA, rowB, i)

                if (i === 'sc_no' || i === 'meter_type') {
                    col_config.width = '180px'
                }
                if (i === 'meters_at_appliance') {
                    col_config.width = '350px'
                }

                col_config.cell = row => {
                    return (
                        <div className='d-flex'>
                            <span className='d-block font-weight-bold'>{row[i] ? typeof row[i] === 'object' ? row[i].join(', ') : row[i] : '--'}</span>
                        </div>
                    )
                }
                column.push(col_config)
            }
        }

        const editCamMeterConfiguration = row => {
            setCenteredModal(true)
            setSelectRow(row)
            row.id ? setFormType('update') : setFormType('add')
        }

        column.push({
            name: 'Action',
            maxWidth: '100px',
            minWidth: '100px',

            cell: row => (
                row.id ? <Edit size='18' className='ml-1 cursor-pointer text-primary' onClick={() => editCamMeterConfiguration(row)} /> :
                    <Plus size='18' className='ml-1 cursor-pointer text-primary' onClick={() => editCamMeterConfiguration(row)} />
            )
        })

        return column
    }

    const siteSelect = () => {
        return (
            <Select
                defaultValue={selected}
                isSearchable={true}
                theme={selectThemeColors}
                options={sites.length && sites}
                onChange={e => setSelected(e)}
                className='react-select rounded'
                classNamePrefix='select'
                placeholder='Select site ...'
            />
        )
    }

    return <>
        {hasError ? (
            <Col lg='12' className=''>
                <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { loader } }} />
            </Col>
        ) : (
            <>
                {
                    loader ? <Loader hight='min-height-475' /> :
                        sitesList.length && props.active === '6' ? <SimpleDataTable
                            columns={tblColumn()}
                            rowCount={100}
                            tblData={sitesList}
                            tableName={props.tableName}
                            flatPicker={siteSelect()}
                        /> : ''
                }
                <Modal isOpen={centeredModal} toggle={() => setCenteredModal(!centeredModal)} className={`modal-dialog-centered modal-lg`}>
                    <ModalHeader toggle={() => setCenteredModal(!centeredModal)}>
                        <span className='m-0 h3'>Configure variable CAM</span>
                    </ModalHeader>
                    <ModalBody>
                        <VariableCamForm row={selectRow} allRow={sitesList} retry={retryAgain} />
                    </ModalBody>
                </Modal>
            </>
        )}
    </>
}

export default VariableCam
