import { Button, Col, Form, Row, Spinner } from 'reactstrap'
import CreateFormField from '@src/views/ui-elements/formElement/createForm'
import { useEffect, useState } from 'react'
import useJwt from '@src/auth/jwt/useJwt'
import jwt_decode from 'jwt-decode'
import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { useLocation, useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import authLogout from '@src/auth/jwt/logoutlogic'

const MySwal = withReactContent(Swal)

const AllocationForm = props => {
    const [spiner, setSpiner] = useState(false)
    const [siteChange, setSiteChange] = useState({})
    const [ebDgSiteChange, setEbDgSiteChange] = useState({})
    const [ebSelected, setEbSelected] = useState([])
    const [dgSelected, setDgSelected] = useState([])
    const [ebDgSite, setEbDgSite] = useState({})
    const [ebMeters, setEbMeters] = useState({})
    const [dgMeters, setDgMeters] = useState({})
    const [switchMeter, setSwitchMeter] = useState({})
    const [siteSelected, setSiteSelected] = useState({})
    const [sensingMeterSelected, setSensingMeterSelected] = useState({})
    const [ebDgSiteSelect, setEbDgSiteSelect] = useState({})
    const [sensingMeterChange, setSensingMeterChange] = useState({})

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

    const postEbDgConfig = async params => {
        return await useJwt
            .postEbDgConfig(params)
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

    const putEbDgConfig = async params => {
        return await useJwt
            .putEbDgConfig(params)
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

    const fetchSites = async params => {
        return await useJwt
            .getGISAssetsTillDTR(params)
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

    const getMeterOfSite = async params => {
        return await useJwt
            .getMeterOfSite(params)
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

    const getEbDgMetersOfSite = async params => {
        return await useJwt
            .getEbDgMetersOfSite(params)
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
        const all_eb_dg = {}
        const selected_site = {}

        const params = {
            project: uri[2],
            vertical: uri[1],
            site_type: 'eb_dg'
        }
        const [statusCode, response] = await fetchSites(params)

        if (statusCode === 200) {
            const raw_data = response.data.data.result.stat.dt_list

            if (!raw_data.length) toast.warning(<Toast msg='No EB DG sites found.' type='warning' />, { hideProgressBar: true })

            for (const i of raw_data) {
                all_eb_dg[i.site_id] = i.site_name

                if (props.type === 'update' && i.site_id === props.selected.eb_dg_site) {
                    selected_site['label'] = i.site_name
                    selected_site['value'] = i.site_id
                }
            }
        } else if (statusCode === 401 || statusCode === 403) {
            setLogout(true)
        } else {
            try {
                toast.warning(<Toast msg={response.data.detail} type='warning' />, { hideProgressBar: true })
            } catch (err) {
                toast.warning(<Toast msg={`Something went wrong to get eb/dg sites.`} type='warning' />, { hideProgressBar: true })
            }
        }

        setEbDgSite(all_eb_dg)

        if (props.type === 'update' && props.selected) {
            const _val = { label: props.selected.site_name, value: `${props.selected.site_name}##${props.selected.site_id}` }
            setSiteSelected({ value: _val, isDisabled: true })
            setSiteChange(_val)
            setEbDgSiteSelect({ value: selected_site })
            setEbDgSiteChange(selected_site)
        }
    }, [])

    // useEffect(async () => {
    //     if (siteChange && Object.keys(siteChange).length) {
    //         const tempSensing = {}

    //         const [statusCode1, response1] = await getMeterOfSite({ site: (siteChange.value).split('##')[1] })

    //         if (statusCode1 === 200) {
    //             const raw_data = response1.data.data.result

    //             if (!raw_data.length) toast.warning(<Toast msg='No meters found for EB/DG sensing.' type='warning' />, { hideProgressBar: true })

    //             for (const i of raw_data) {
    //                 tempSensing[i.meter_address] = i.meter_address
    //             }
    //         } else if (statusCode1 === 401 || statusCode1 === 403) {
    //             setLogout(true)
    //         } else {
    //             try {
    //                 toast.warning(<Toast msg={response1.data.detail} type='warning' />, { hideProgressBar: true })
    //             } catch (err) {
    //                 toast.warning(<Toast msg={`Something went wrong to get eb/dg meters for EB/DG sensing`} type='warning' />, { hideProgressBar: true })
    //             }
    //         }

    //         setSwitchMeter(tempSensing)
    //         setSiteSelected({ value: siteChange, isDisabled: props.type === 'update' && true })
    //         if (props.type === 'update' && props.selected) {
    //             const _val = { label: props.selected.sensing_meter, value: props.selected.sensing_meter }
    //             setSensingMeterSelected({ value: _val })
    //         }
    //     }
    // }, [siteChange])

    useEffect(async () => {
        if (ebDgSiteChange && Object.keys(ebDgSiteChange).length) {
            // let tempEb = {}
            // let tempDg = {}
            // let _selectedEb = false
            // let _selectedDg = false

            // const [statusCode1, response1] = await getEbDgMetersOfSite({ site: (ebDgSiteChange.value) })

            // if (statusCode1 === 200) {
            //     const raw_data = response1.data.data.result

            //     if (!raw_data) toast.warning(<Toast msg='No EB/DG meters found.' type='warning' />, { hideProgressBar: true })

            //     tempEb = { ...raw_data.EB_Meter }
            //     tempDg = { ...raw_data.DG_Meter }
            // } else if (statusCode1 === 401 || statusCode1 === 403) {
            //     setLogout(true)
            // } else {
            //     try {
            //         toast.warning(<Toast msg={response1.data.detail} type='warning' />, { hideProgressBar: true })
            //     } catch (err) {
            //         toast.warning(<Toast msg={`Something went wrong to get eb/dg meters.`} type='warning' />, { hideProgressBar: true })
            //     }
            // }

            // setEbMeters(tempEb)
            // setDgMeters(tempDg)

            // // Select all options
            // if (Object.keys(tempEb).length) {
            //     _selectedEb = []
            //     for (const i in tempEb) {
            //         _selectedEb.push({ label: i, value: i })
            //     }
            // }
            // if (Object.keys(tempDg).length) {
            //     _selectedDg = []
            //     for (const j in tempDg) {
            //         _selectedDg.push({ label: j, value: j })
            //     }
            // }

            // setEbSelected({ value: _selectedEb })
            // setDgSelected({ value: _selectedDg })
            setEbDgSiteSelect({ value: ebDgSiteChange })
        }
    }, [ebDgSiteChange])

    // useEffect(() => {
    //     setSensingMeterSelected({ value: sensingMeterChange })
    // }, [sensingMeterChange])

    const fields = {
        'select#site_id': { label: 'Select site*', options: props.sites, extras: siteSelected, onchange: setSiteChange },
        'select#eb_dg_site': { label: 'Select EB/DG site*', options: ebDgSite, extras: ebDgSiteSelect, onchange: setEbDgSiteChange },
        // 'select#eb_meters': { label: 'Selected EB meters', options: ebMeters, multiple: true, extras: ebSelected },
        // 'select#dg_meters': { label: 'Selected DG meters', options: dgMeters, multiple: true, extras: dgSelected },
        // 'select#sensing_meter': { label: 'Select meter for EB/DG sensing*', options: switchMeter, extras: sensingMeterSelected, onchange: setSensingMeterChange },
        row: 6
    }

    let userEmail = 'n/a'

    if (localStorage.getItem('accessToken')) {
        userEmail = jwt_decode(localStorage.getItem('accessToken')).userData.email
    }

    const handleFormSubmit = async e => {
        e.preventDefault()
        setSpiner(true)

        const formData = new FormData(document.getElementById('ebDgAllocationForm'))
        const site = props.type === 'update' ? `${props.selected.site_name}##${props.selected.site_id}`.split('##') : formData.get('site_id').split('##')

        formData.set('site_id', site[1])
        formData.set('site_name', site[0])
        formData.set('updated_by', userEmail)

        // if (ebMeters) {
        //     const _eb_meters = []
        //     for (const i in ebMeters) {
        //         _eb_meters.push(i)
        //     }

        //     formData.set('eb_meters', JSON.stringify(_eb_meters))
        // }
        // if (dgMeters) {
        //     const _dg_meters = []
        //     for (const i in dgMeters) {
        //         _dg_meters.push(i)
        //     }

        //     formData.set('dg_meters', JSON.stringify(_dg_meters))
        // }

        const params = {}
        let flag = true

        formData.forEach((value, key) => {
            if (!flag) {
                return true
            }
            if (!value) {
                toast.warning(<Toast msg={`${key} should not be null.`} type='warning' />, { hideProgressBar: true })
                flag = false
            }
            params[key] = value
        })

        if (!flag) {
            setSpiner(false)
            return false
        }

        const [statusCode, response] = props.type === 'update' ? await putEbDgConfig(params) : await postEbDgConfig(params)

        if (statusCode === 201 || statusCode === 200) {
            const resp = response.data.data.result

            MySwal.fire({
                icon: 'success',
                title: 'Success',
                text: resp,
                customClass: { confirmButton: 'btn btn-success' }
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

    return <>
        <p><b>Please note: </b> Select same site if the EB and DG meters exists in same site.</p>
        <Form id='ebDgAllocationForm'>
            <Row>
                {ebDgSite && <CreateFormField fields={fields} />}

                <Col xs='12' className='text-center pb-1 pt-2'>
                    <Button color='primary' onClick={handleFormSubmit} disabled={spiner && true}>
                        Allocate meters &nbsp; &nbsp; {spiner && <Spinner size='sm' />}
                    </Button>
                </Col>
            </Row>
        </Form>
    </>
}

export default AllocationForm