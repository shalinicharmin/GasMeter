import { Button, Col, Form, Row, Spinner } from 'reactstrap'
import CreateFormField from '@src/views/ui-elements/formElement/createForm'
import { useState, useEffect } from 'react'
import useJwt from '@src/auth/jwt/useJwt'
import jwt_decode from 'jwt-decode'
import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import moment from 'moment'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import authLogout from '@src/auth/jwt/logoutlogic'

const MySwal = withReactContent(Swal)

const VariableCamForm = props => {
    const [spiner, setSpiner] = useState(false)
    const [meterTypeChange, setMeterTypeChange] = useState({})
    const [noOfBedStatus, setNoOfBedStatus] = useState(true)
    const [displayFloorNo, setDisplayFloorNo] = useState(true)
    const [displayFlatNo, setDisplayFlatNo] = useState(true)
    const [displayRoomNo, setDisplayRoomNo] = useState(true)
    const [attachStatus, setAttachStatus] = useState(true)
    const [camParams, setCamParams] = useState({})
    const [attachParams, setAttachParams] = useState([])
    const [attachOptions, setAttachOptions] = useState({})
    const [noOfBed, setNoOfBed] = useState(props.row.no_of_bed)

    // Logout User
    const [logout, setLogout] = useState(false)
    const dispatch = useDispatch()
    const history = useHistory()

    useEffect(() => {
        if (logout) {
            authLogout(history, dispatch)
        }
    }, [logout])

    useEffect(() => {
        setCamParams({ value: props.row.meter_type ? { label: props.row.meter_type, value: `is_${props.row.meter_type.replaceAll(' ', '_').toLowerCase()}` } : [] })

        const flat_meters = {}
        for (const i of props.allRow) {
            if (i.meter_type === 'Room prepaid meter') {
                flat_meters[i.sc_no] = i.sc_no
            }
            // flat_meters[i.sc_no] = i.sc_no
        }
        setAttachOptions(flat_meters)

        if (props.row.meter_type === 'Floor CAM') {
            setDisplayFloorNo(false)
        } else if (props.row.meter_type === 'Flat CAM') {
            setDisplayFloorNo(false)
            setDisplayFlatNo(false)
        } else if (props.row.meter_type === 'Room prepaid meter') {
            setDisplayFloorNo(false)
            setDisplayFlatNo(false)
            setDisplayRoomNo(false)
            setNoOfBedStatus(false)
        } else if (props.row.meter_type === 'Appliance CAM') {
            if (props.row.meters_at_appliance) {
                const _meters_selected = []
                for (const i of props.row.meters_at_appliance) {
                    _meters_selected.push({ label: i, value: i })
                }
                setAttachParams(_meters_selected)
            }
            setDisplayFloorNo(false)
            setDisplayFlatNo(false)
            setAttachStatus(false)
        } else {
            setNoOfBed('0')
        }
    }, [])

    useEffect(() => {
        if (meterTypeChange && Object.keys(meterTypeChange).length) {
            setDisplayFloorNo(true)
            setDisplayFlatNo(true)
            setDisplayRoomNo(true)
            setNoOfBedStatus(true)
            setAttachStatus(true)

            if (meterTypeChange.value === 'is_floor_cam') {
                setDisplayFloorNo(false)
            } else if (meterTypeChange.value === 'is_flat_cam') {
                setDisplayFloorNo(false)
                setDisplayFlatNo(false)
            } else if (meterTypeChange.value === 'is_room_prepaid_meter') {
                setDisplayFloorNo(false)
                setDisplayFlatNo(false)
                setDisplayRoomNo(false)
                setNoOfBedStatus(false)
            } else if (meterTypeChange.value === 'is_appliance_cam') {
                setDisplayFloorNo(false)
                setDisplayFlatNo(false)
                setAttachStatus(false)
                setNoOfBed('0')
            } else {
                setNoOfBed('0')
            }
            setCamParams({ value: meterTypeChange })
        }
    }, [meterTypeChange])

    const fields = {
        'text#sc_no': { label: 'Sc. No.', disable: true, value: props.row.sc_no },
        'select#meter_type': {
            label: 'Select meter type',
            options: { is_project_cam: 'Project CAM', is_tower_cam: 'Tower CAM', is_floor_cam: 'Floor CAM', is_flat_cam: 'Flat CAM', is_appliance_cam: 'Appliance CAM', is_room_prepaid_meter: 'Room prepaid meter' },
            onchange: setMeterTypeChange,
            extras: camParams
        },
        'number#floor_no': { label: 'Floor no', display: displayFloorNo, value: props.row.floor_no },
        'number#flat_no': { label: 'Flat no', display: displayFlatNo, value: props.row.flat_no },
        'number#room_no': { label: 'Room no', display: displayRoomNo, value: props.row.room_no },
        'number#no_of_bed': { label: 'No. of bed/beds', display: noOfBedStatus, value: noOfBed },
        'select#meters_at_appliance': { label: 'Select room meters attached with Appliance CAM', display: attachStatus, multiple: true, extras: { value: attachParams }, options: attachOptions, onchange: setAttachParams },
        row: 6
    }

    let userEmail = 'n/a'

    if (localStorage.getItem('accessToken')) {
        userEmail = jwt_decode(localStorage.getItem('accessToken')).userData.email
    }

    const addUpdateVariableCam = async params => {
        return await useJwt
            .addUpdateVariableCam(params)
            .then(res => {
                const status = res.status
                return [status, res]
            }).catch(err => {
                if (err.response) {
                    const status = err.response.status
                    return [status, err]
                } else {
                    return [0, err]
                }
            })
    }

    const handleFormSubmit = async e => {
        e.preventDefault()
        setSpiner(true)

        const formData = new FormData(document.getElementById('variablCamForm'))
        formData.set('site_id', props.row.site_id)
        formData.set('project', props.row.project)
        formData.set('added_updated_by', userEmail)

        const params = {}
        let flag = true

        if (formData.get('meter_type') === 'is_room_prepaid_meter') {
            if (!formData.get('flat_no') || !formData.get('floor_no') || !formData.get('room_no')) {
                toast.warning(<Toast msg={`Please notice! Flat no OR Floor no OR Room no should not be null.`} type='warning' />, { hideProgressBar: true })
                flag = false
            }
            if (!formData.get('no_of_bed') || formData.get('no_of_bed') < 1) {
                toast.warning(<Toast msg={`Please notice! Number of beds should not be null or zero.`} type='warning' />, { hideProgressBar: true })
                flag = false
            }
            if (formData.get('no_of_bed') > 9) {
                toast.warning(<Toast msg={`Please notice! Number of beds should not be greater then 9.`} type='warning' />, { hideProgressBar: true })
                flag = false
            }
        } else if (formData.get('meter_type') === 'is_floor_cam') {
            if (!formData.get('floor_no')) {
                toast.warning(<Toast msg={`Please notice! Floor no should not be null.`} type='warning' />, { hideProgressBar: true })
                flag = false
            }
            if (Number(formData.get('no_of_bed'))) {
                toast.warning(<Toast msg={`Please notice! Number of beds should be null in case of Flat, Floor, Tower OR Project CAM.`} type='warning' />, { hideProgressBar: true })
                flag = false
            }
        } else if (formData.get('meter_type') === 'is_flat_cam') {
            if (!formData.get('flat_no') || !formData.get('floor_no')) {
                toast.warning(<Toast msg={`Please notice! Flat no OR Floor no should not be null.`} type='warning' />, { hideProgressBar: true })
                flag = false
            }
            if (Number(formData.get('no_of_bed'))) {
                toast.warning(<Toast msg={`Please notice! Number of beds should be null in case of Flat, Floor, Tower OR Project CAM.`} type='warning' />, { hideProgressBar: true })
                flag = false
            }
        }

        formData.forEach((value, key) => {
            if (!flag) {
                return true
            }
            if (key === 'project') {
                if (!value) {
                    toast.warning(<Toast msg={`Please notice! Project name for site should not be null.`} type='warning' />, { hideProgressBar: true })
                    flag = false
                }
            }
            if (key === 'floor_no') {
                if (parseFloat(value)) {
                    if (!Number.isInteger(parseFloat(value))) {
                        toast.warning(<Toast msg={`Please notice! Floor number should be an Integer value.`} type='warning' />, { hideProgressBar: true })
                        flag = false
                    }
                    if (parseFloat(value) > 99 || parseFloat(value) < 0) {
                        toast.warning(<Toast msg={`Please notice! Floor number should be under 0 to 99.`} type='warning' />, { hideProgressBar: true })
                        flag = false
                    }
                }
            }
            if (key === 'flat_no') {
                if (parseFloat(value)) {
                    if (!Number.isInteger(parseFloat(value))) {
                        toast.warning(<Toast msg={`Please notice! Flat number should be an Integer value.`} type='warning' />, { hideProgressBar: true })
                        flag = false
                    }
                    if (parseFloat(value) < 1) {
                        toast.warning(<Toast msg={`Please notice! Flat number should be greater then 0.`} type='warning' />, { hideProgressBar: true })
                        flag = false
                    }
                }
            }
            if (key === 'room_no') {
                if (parseFloat(value)) {
                    if (!Number.isInteger(parseFloat(value))) {
                        toast.warning(<Toast msg={`Please notice! Room number should be an Integer value.`} type='warning' />, { hideProgressBar: true })
                        flag = false
                    }
                    if (parseFloat(value) > 50 || parseFloat(value) < 1) {
                        toast.warning(<Toast msg={`Please notice! Room number should be under 1 to 50.`} type='warning' />, { hideProgressBar: true })
                        flag = false
                    }
                }
            }
            params[key] = value
        })

        if (formData.get('meter_type') === 'is_appliance_cam') {
            const appliance_meters = formData.getAll('meters_at_appliance')

            if (appliance_meters.length < 2) {
                toast.warning(<Toast msg={`Please select at least two meters to attach with appliance CAM.`} type='warning' />, { hideProgressBar: true })
                flag = false
            }
            params.meters_at_appliance = JSON.stringify(appliance_meters)
        } else {
            params.meters_at_appliance = undefined
        }

        if (formData.get('meter_type') !== 'is_room_prepaid_meter') {
            params.no_of_bed = undefined
        }

        if (!flag) {
            setSpiner(false)
            return false
        }

        const [statusCode, response] = await addUpdateVariableCam(params)

        if (statusCode === 201 || statusCode === 200) {
            const resp = response.data.data.result

            MySwal.fire({
                icon: 'success',
                title: 'Success',
                text: resp,
                customClass: {
                    confirmButton: 'btn btn-success'
                }
            })
            props.retry()
        } else if (statusCode === 401 || statusCode === 403) {
            setLogout(true)
        } else {
            try {
                MySwal.fire({
                    icon: 'error',
                    title: 'Please notice !',
                    text: response.data.detail,
                    customClass: {
                        confirmButton: 'btn btn-danger'
                    }
                })
            } catch (err) {
                MySwal.fire({
                    icon: 'error',
                    title: 'Please notice !',
                    text: 'Something went wrong',
                    customClass: {
                        confirmButton: 'btn btn-danger'
                    }
                })
            }
        }
        setSpiner(false)
    }

    return <Form id='variablCamForm'>
        <Row>
            <Col xs='12' className='mb-2'>
                <small className='text-danger'>Please notice the variable CAM configuration is subject to financial management, So please insert the configuration details carefully.</small>
            </Col>

            <CreateFormField fields={fields} />

            <Col xs='12' className='text-center pb-1 pt-2'>
                <Button color='primary' onClick={handleFormSubmit} disabled={spiner && true}>
                    Configure CAM &nbsp; &nbsp; {spiner && <Spinner size='sm' />}
                </Button>
            </Col>
        </Row>
    </Form>
}

export default VariableCamForm