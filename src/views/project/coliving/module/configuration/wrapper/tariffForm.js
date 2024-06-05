import { Button, Spinner, Col, Form, Row } from 'reactstrap'
import CreateFormField from '@src/views/ui-elements/formElement/createForm'
import AppCollapse from '@components/app-collapse'
import { useEffect, useState } from 'react'
import useJwt from '@src/auth/jwt/useJwt'
import jwt_decode from 'jwt-decode'
import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import authLogout from '@src/auth/jwt/logoutlogic'

const MySwal = withReactContent(Swal)

const TariffForm = props => {
  const [spiner, setSpiner] = useState(false)
  const [ebPrice, setEbPrice] = useState(100)
  const [dgPrice, setDgPrice] = useState(100)
  const [viewRow, setViewRow] = useState('')
  const [resp, setResp] = useState(false)
  const [ebMeterSelected, setEbMeterSelected] = useState({})
  const [dgMeterSelected, setDgMeterSelected] = useState({})
  const selected = { add: '', update: '', all: [] }

  // Logout User
  const [logout, setLogout] = useState(false)
  const dispatch = useDispatch()
  const history = useHistory()
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  if (props.row) {
    for (const i of props.row[0]) {
      if (i.eb_price !== '-' && i.status !== '-') {
        selected.update += `${i.meter_ip}, `
      } else {
        selected.add += `${i.meter_ip}, `
      }
      selected.all.push({ meter_ip: i.meter_ip, meter_version: i.meter_version })
    }
  }

  let userEmail = 'n/a'

  if (localStorage.getItem('accessToken')) {
    userEmail = jwt_decode(localStorage.getItem('accessToken')).userData.email
  }

  const getEbDgMeter = async params => {
    return await useJwt
      .getEbDgMeter(params)
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

  const postEbDgMeter = async params => {
    return await useJwt
      .postEbDgMeter(params)
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

  useEffect(async () => {
    setViewRow('')

    if (props.viewRow) {
      const eb_full_tariff = props.viewRow.eb_full_tariff.replaceAll('[', '').replaceAll(']', '').split(',')
      const dg_full_tariff = props.viewRow.dg_full_tariff.replaceAll('[', '').replaceAll(']', '').split(',')

      if (props.viewRow.eb_price !== '-') {
        setEbPrice(props.viewRow.eb_price)
      }
      if (props.viewRow.eb_price !== '-') {
        setDgPrice(props.viewRow.dg_price)
      }
      setViewRow([[props.viewRow.eb_price, ...eb_full_tariff], [props.viewRow.dg_price, ...dg_full_tariff]])
    }

    const params = { site: props.site.value }

    const [statusCode, response] = await getEbDgMeter(params)
    const eb_meters = {}
    const dg_meters = {}

    if (statusCode === 200) {
      const resp = response.data.data.result

      if (!resp.eb_meters.length && !resp.dg_meters.length) {
        MySwal.fire({
          icon: 'warning',
          title: 'Please notice!',
          html: `
            No EB or DG meters found at this site, This is the reasion (Main EB Meter) field reflacts <b>0.0.0.0</b>.
            If it is not Right then please configure the EB and DG meter first at EB/DG Allocation tab.
          `,
          customClass: {
            confirmButton: 'btn btn-success'
          }
        })
      }

      if (resp.eb_meters.length) {
        for (const i of resp.eb_meters) {
          eb_meters[i] = i
        }
        setEbMeterSelected({ value: { label: resp.eb_meters[0], value: resp.eb_meters[0] } })
      } else {
        eb_meters['0.0.0.0'] = '0.0.0.0'
        setEbMeterSelected({ value: { label: '0.0.0.0', value: '0.0.0.0' } })
      }

      if (resp.dg_meters.length) {
        for (const i of resp.dg_meters) {
          dg_meters[i] = i
        }
        setDgMeterSelected({ value: { label: resp.dg_meters[0], value: resp.dg_meters[0] } })
      }

      setResp([eb_meters, dg_meters])
    } else if (statusCode === 206) {
      toast.warning(<Toast msg={response.data.detail} type='warning' />, { hideProgressBar: true })

      eb_meters['0.0.0.0'] = '0.0.0.0'
      setEbMeterSelected({ value: { label: '0.0.0.0', value: '0.0.0.0' } })
      setResp([eb_meters, dg_meters])
    } else if (statusCode === 401 || statusCode === 403) {
      setLogout(true)
    } else {
      toast.error(<Toast msg={'Something went wrong.'} type='error' />, { hideProgressBar: true })
    }
  }, [])

  const fields_eb = viewRow && {
    'select#eb_main_meter': { label: 'Main EB Meter', options: resp && resp[0], extras: ebMeterSelected },
    'number#eb_price': { label: 'Price (Paise)', value: viewRow && viewRow[0].length === 27 ? viewRow[0][0] : ebPrice, onKeyUp: setEbPrice },
    'select#eb_fd_type': { label: 'FD Type', options: { 0: 'Daily FD', 1: 'Monthly FD', 2: 'Slabwise FD' }, extras: { value: { label: 'Monthly FD', value: '1' }, isDisabled: true } },
    'select#eb_fd_telescopic': { label: 'FD Telescopic', options: { 0: '0', 1: '1' }, extras: { value: { label: '0', value: '0' }, isDisabled: true } },
    'select#eb_mmc_app': { label: 'MMC App', options: { 0: '0', 1: '1' }, extras: { value: { label: '1', value: '1' }, isDisabled: true } },
    'number#eb_friendly_hours_pm': { label: 'Friendly hours PM (13-24)', value: viewRow && viewRow[0].length === 27 ? viewRow[0][4] : 0 },
    'number#eb_friendly_hours_am': { label: 'Friendly hours AM (0-12)', value: viewRow && viewRow[0].length === 27 ? viewRow[0][5] : 0 },
    'number#eb_alert_limit': { label: 'Alert limit (x10 Rs)', value: viewRow && viewRow[0].length === 27 ? viewRow[0][6] : 10 },
    'number#eb_emergency_credit': { label: 'Emergency credits (x10 Rs)', value: viewRow && viewRow[0].length === 27 ? viewRow[0][7] : 0 },
    'number#eb_top_up_limit': { label: 'Top-up limit (x1000 Rs)', value: viewRow && viewRow[0].length === 27 ? viewRow[0][8] : 10 },
    'number#eb_mmc': { label: 'Monthly minimum c. (Rs)', value: viewRow && viewRow[0].length === 27 ? viewRow[0][9] : 0 },
    'number#eb_fd_price0': { label: 'Fd price[0] (Paise)', value: viewRow && viewRow[0].length === 27 ? viewRow[0][10] : 0 },
    'number#eb_fd_price1': { label: 'Fd price[1] (Paise)', value: viewRow && viewRow[0].length === 27 ? viewRow[0][11] : 0 },
    'number#eb_fd_price2': { label: 'Fd price[2] (Paise)', value: viewRow && viewRow[0].length === 27 ? viewRow[0][12] : 0 },
    'number#eb_fd_price3': { label: 'Fd price[3] (Paise)', value: viewRow && viewRow[0].length === 27 ? viewRow[0][13] : 0 },
    'number#eb_fd_price4': { label: 'Fd price[4] (Paise)', value: viewRow && viewRow[0].length === 27 ? viewRow[0][14] : 0 },
    'number#eb_fd_price5': { label: 'Fd price[5] (Paise)', value: viewRow && viewRow[0].length === 27 ? viewRow[0][15] : 0 },
    'number#eb_slab_price0': viewRow && props.type === 'view' && viewRow[0].length === 27 ?
      { label: 'Slab price[0] (Paise)', value: viewRow[0][16], disable: true } :
      { label: 'Slab price[0] (Paise)', changable: ebPrice, disable: true },
    'number#eb_slab_price1': { label: 'Slab price[1] (Paise)', value: viewRow && viewRow[0].length === 27 ? viewRow[0][17] : 0 },
    'number#eb_slab_price2': { label: 'Slab price[2] (Paise)', value: viewRow && viewRow[0].length === 27 ? viewRow[0][18] : 0 },
    'number#eb_slab_price3': { label: 'Slab price[3] (Paise)', value: viewRow && viewRow[0].length === 27 ? viewRow[0][19] : 0 },
    'number#eb_slab_price4': { label: 'Slab price[4] (Paise)', value: viewRow && viewRow[0].length === 27 ? viewRow[0][20] : 0 },
    'number#eb_slab_price5': { label: 'Slab price[5] (Paise)', value: viewRow && viewRow[0].length === 27 ? viewRow[0][21] : 0 },
    'number#eb_slab_energy0': { label: 'Slab energy[0] (kWh)', value: viewRow && viewRow[0].length === 27 ? viewRow[0][22] : 0 },
    'number#eb_slab_energy1': { label: 'Slab energy[1] (kWh)', value: viewRow && viewRow[0].length === 27 ? viewRow[0][23] : 0 },
    'number#eb_slab_energy2': { label: 'Slab energy[2] (kWh)', value: viewRow && viewRow[0].length === 27 ? viewRow[0][24] : 0 },
    'number#eb_slab_energy3': { label: 'Slab energy[3] (kWh)', value: viewRow && viewRow[0].length === 27 ? viewRow[0][25] : 0 },
    'number#eb_slab_energy4': { label: 'Slab energy[4] (kWh)', value: viewRow && viewRow[0].length === 27 ? viewRow[0][26] : 0 },
    row: 2
  }
  const fields_dg = viewRow && {
    'select#dg_main_meter': { label: 'Main DG Meter', options: resp && resp[1], extras: dgMeterSelected },
    'number#dg_price': { label: 'Price (Paise)', value: viewRow && viewRow[1].length === 27 ? viewRow[1][0] : dgPrice, onKeyUp: setDgPrice },
    'select#dg_fd_type': { label: 'FD Type', options: { 0: 'Daily FD', 1: 'Monthly FD', 2: 'Slabwise FD' }, extras: { value: { label: 'Monthly FD', value: '1' }, isDisabled: true } },
    'select#dg_fd_telescopic': { label: 'FD Telescopic', options: { 0: '0', 1: '1' }, extras: { value: { label: '0', value: '0' }, isDisabled: true } },
    'select#dg_mmc_app': { label: 'MMC App', options: { 0: '0', 1: '1' }, extras: { value: { label: '1', value: '1' }, isDisabled: true } },
    'number#dg_friendly_hours_pm': { label: 'Friendly hours PM (13-24)', value: viewRow && viewRow[1].length === 27 ? viewRow[1][4] : 0 },
    'number#dg_friendly_hours_am': { label: 'Friendly hours AM (0-12)', value: viewRow && viewRow[1].length === 27 ? viewRow[1][5] : 0 },
    'number#dg_alert_limit': { label: 'Alert limit (x10 Rs)', value: viewRow && viewRow[1].length === 27 ? viewRow[1][6] : 10 },
    'number#dg_emergency_credit': { label: 'Emergency credits (x10 Rs)', value: viewRow && viewRow[1].length === 27 ? viewRow[1][7] : 0 },
    'number#dg_top_up_limit': { label: 'Top-up limit (x1000 Rs)', value: viewRow && viewRow[1].length === 27 ? viewRow[1][8] : 10 },
    'number#dg_mmc': { label: 'Monthly minimum c. (Rs)', value: viewRow && viewRow[1].length === 27 ? viewRow[1][9] : 0 },
    'number#dg_fd_price0': { label: 'Fd price[0] (Paise)', value: viewRow && viewRow[1].length === 27 ? viewRow[1][10] : 0 },
    'number#dg_fd_price1': { label: 'Fd price[1] (Paise)', value: viewRow && viewRow[1].length === 27 ? viewRow[1][11] : 0 },
    'number#dg_fd_price2': { label: 'Fd price[2] (Paise)', value: viewRow && viewRow[1].length === 27 ? viewRow[1][12] : 0 },
    'number#dg_fd_price3': { label: 'Fd price[3] (Paise)', value: viewRow && viewRow[1].length === 27 ? viewRow[1][13] : 0 },
    'number#dg_fd_price4': { label: 'Fd price[4] (Paise)', value: viewRow && viewRow[1].length === 27 ? viewRow[1][14] : 0 },
    'number#dg_fd_price5': { label: 'Fd price[5] (Paise)', value: viewRow && viewRow[1].length === 27 ? viewRow[1][15] : 0 },
    'number#dg_slab_price0': viewRow && props.type === 'view' && viewRow[1].length === 27 ?
      { label: 'Slab price[0] (Paise)', value: viewRow[1][16], disable: true } :
      { label: 'Slab price[0] (Paise)', changable: dgPrice, disable: true },
    'number#dg_slab_price1': { label: 'Slab price[1] (Paise)', value: viewRow && viewRow[1].length === 27 ? viewRow[1][17] : 0 },
    'number#dg_slab_price2': { label: 'Slab price[2] (Paise)', value: viewRow && viewRow[1].length === 27 ? viewRow[1][18] : 0 },
    'number#dg_slab_price3': { label: 'Slab price[3] (Paise)', value: viewRow && viewRow[1].length === 27 ? viewRow[1][19] : 0 },
    'number#dg_slab_price4': { label: 'Slab price[4] (Paise)', value: viewRow && viewRow[1].length === 27 ? viewRow[1][20] : 0 },
    'number#dg_slab_price5': { label: 'Slab price[5] (Paise)', value: viewRow && viewRow[1].length === 27 ? viewRow[1][21] : 0 },
    'number#dg_slab_energy0': { label: 'Slab energy[0] (kWh)', value: viewRow && viewRow[1].length === 27 ? viewRow[1][22] : 0 },
    'number#dg_slab_energy1': { label: 'Slab energy[1] (kWh)', value: viewRow && viewRow[1].length === 27 ? viewRow[1][23] : 0 },
    'number#dg_slab_energy2': { label: 'Slab energy[2] (kWh)', value: viewRow && viewRow[1].length === 27 ? viewRow[1][24] : 0 },
    'number#dg_slab_energy3': { label: 'Slab energy[3] (kWh)', value: viewRow && viewRow[1].length === 27 ? viewRow[1][25] : 0 },
    'number#dg_slab_energy4': { label: 'Slab energy[4] (kWh)', value: viewRow && viewRow[1].length === 27 ? viewRow[1][26] : 0 },
    row: 2
  }

  const handleFormSubmit = async e => {
    e.preventDefault()
    setSpiner(true)

    const formData = new FormData(document.getElementById('tariffForm'))
    let eb_full_tariff = ''
    let dg_full_tariff = ''

    formData.set('site_id', props.site.value)
    formData.set('updated_by', userEmail)

    const params = {}
    const temp = {}
    let flag = true

    formData.forEach((value, key) => {
      if (!flag) {
        return false
      }
      if (!value) {
        toast.warning(<Toast msg={`${key.charAt(0).toUpperCase()}${key.slice(1).replaceAll('_', ' ')} should not be null.`} type='warning' />, { hideProgressBar: true })
        flag = false
      }
      if (['eb_price', 'dg_price'].includes(key) && (value < 10 || value > 60000)) {
        toast.warning(<Toast msg={`${key.charAt(0).toUpperCase()}${key.slice(1).replaceAll('_', ' ')} should not be less then 10 and greator then 60000 (in Paise).`} type='warning' />, { hideProgressBar: true })
        flag = false
      }
      if (['eb_friendly_hours_am', 'dg_friendly_hours_am'].includes(key) && (value < 0 || value > 12)) {
        toast.warning(<Toast msg={`Invalid Params in ${key.charAt(0).toUpperCase()}${key.slice(1).replaceAll('_', ' ')}.`} type='warning' />, { hideProgressBar: true })
        flag = false
      }
      if (['eb_friendly_hours_pm', 'dg_friendly_hours_pm'].includes(key) && ((value < 13 || value > 24) && parseInt(value) !== 0)) {
        toast.warning(<Toast msg={`Invalid Params in ${key.charAt(0).toUpperCase()}${key.slice(1).replaceAll('_', ' ')}.`} type='warning' />, { hideProgressBar: true })
        flag = false
      }
      if (['eb_alert_limit', 'dg_alert_limit', 'eb_emergency_credit', 'dg_emergency_credit', 'eb_top_up_limit', 'dg_top_up_limit'].includes(key) && (value < 0 || value > 250)) {
        toast.warning(<Toast msg={`${key.charAt(0).toUpperCase()}${key.slice(1).replaceAll('_', ' ')} value should be under 1 to 250.`} type='warning' />, { hideProgressBar: true })
        flag = false
      }
      if (['eb_mmc', 'dg_mmc'].includes(key) && (value < 0 || value > 60000)) {
        toast.warning(<Toast msg={`Invalid Params in ${key.charAt(0).toUpperCase()}${key.slice(1).replaceAll('_', ' ')}.`} type='warning' />, { hideProgressBar: true })
        flag = false
      }
      if ([
        'eb_fd_price0', 'eb_fd_price1', 'eb_fd_price2', 'eb_fd_price3', 'eb_fd_price4', 'eb_fd_price5',
        'dg_fd_price0', 'dg_fd_price1', 'dg_fd_price2', 'dg_fd_price3', 'dg_fd_price4', 'dg_fd_price5'
      ].includes(key) && value > 100000) {
        toast.warning(<Toast msg={`${key.charAt(0).toUpperCase()}${key.slice(1).replaceAll('_', ' ')} must be less than 100000 (in Paise).`} type='warning' />, { hideProgressBar: true })
        flag = false
      }
      if ([
        'eb_slab_price0', 'eb_slab_price1', 'eb_slab_price2', 'eb_slab_price3', 'eb_slab_price4', 'eb_slab_price5',
        'dg_slab_price0', 'dg_slab_price1', 'dg_slab_price2', 'dg_slab_price3', 'dg_slab_price4', 'dg_slab_price5',
        'eb_slab_energy0', 'eb_slab_energy1', 'eb_slab_energy2', 'eb_slab_energy3', 'eb_slab_energy4',
        'dg_slab_energy0', 'dg_slab_energy1', 'dg_slab_energy2', 'dg_slab_energy3', 'dg_slab_energy4'
      ].includes(key) && value > 60000) {
        toast.warning(<Toast msg={`${key.charAt(0).toUpperCase()}${key.slice(1).replaceAll('_', ' ')} must be less than 60000 (in Paise) and Slab Energy must be less than 60000 (in kWh).`} type='warning' />, { hideProgressBar: true })
        flag = false
      }
      temp[key] = value
    })

    function slabConditions(slab, tag) {
      for (let i = 1; i < slab.length; i++) {
        if (!flag) {
          return false
        }
        if (parseInt(slab[i]) === 0) {
          for (let j = i + 1; j < slab.length; j++) {
            if (parseInt(slab[j]) !== 0) {
              toast.warning(<Toast msg={`Please note! ${tag} should not be zero between.`} type='warning' />, { hideProgressBar: true })
              flag = false
              return false
            }
          }
        } else if (parseInt(slab[i]) < parseInt(slab[i - 1])) {
          toast.warning(<Toast msg={`Please note! ${tag} every value should be greater then previous value.`} type='warning' />, { hideProgressBar: true })
          flag = false
        }
      }
    }

    // Terminate if any EB slab price is zero or less then previous data except first value
    slabConditions([temp.eb_slab_price0, temp.eb_slab_price1, temp.eb_slab_price2, temp.eb_slab_price3, temp.eb_slab_price4, temp.eb_slab_price5], 'EB slab price');
    // Terminate if any EB slab energy is zero or less then previous data except first value
    slabConditions([temp.eb_slab_energy0, temp.eb_slab_energy1, temp.eb_slab_energy2, temp.eb_slab_energy3, temp.eb_slab_energy4], 'EB slab energy');

    // Terminate if any DG slab price is zero or less then previous data except first value
    slabConditions([temp.dg_slab_price0, temp.dg_slab_price1, temp.dg_slab_price2, temp.dg_slab_price3, temp.dg_slab_price4, temp.dg_slab_price5], 'DG slab price');
    // Terminate if any DG slab energy is zero or less then previous data except first value
    slabConditions([temp.dg_slab_energy0, temp.dg_slab_energy1, temp.dg_slab_energy2, temp.dg_slab_energy3, temp.dg_slab_energy4], 'DG slab energy');

    if (!flag) {
      setSpiner(false)
      return false
    }

    eb_full_tariff += `1,0,1,${temp.eb_friendly_hours_pm},${temp.eb_friendly_hours_am},${temp.eb_alert_limit},${temp.eb_emergency_credit},${temp.eb_top_up_limit},${temp.eb_mmc},`
    eb_full_tariff += `[${temp.eb_fd_price0},${temp.eb_fd_price1},${temp.eb_fd_price2},${temp.eb_fd_price3},${temp.eb_fd_price4},${temp.eb_fd_price5}],`
    eb_full_tariff += `[${temp.eb_slab_price0},${temp.eb_slab_price1},${temp.eb_slab_price2},${temp.eb_slab_price3},${temp.eb_slab_price4},${temp.eb_slab_price5}],`
    eb_full_tariff += `[${temp.eb_slab_energy0},${temp.eb_slab_energy1},${temp.eb_slab_energy2},${temp.eb_slab_energy3},${temp.eb_slab_energy4}]`

    if (Object.keys(resp[1]).length) {
      dg_full_tariff += `1,0,1,${temp.dg_friendly_hours_pm},${temp.dg_friendly_hours_am},${temp.dg_alert_limit},${temp.dg_emergency_credit},${temp.dg_top_up_limit},${temp.dg_mmc},`
      dg_full_tariff += `[${temp.dg_fd_price0},${temp.dg_fd_price1},${temp.dg_fd_price2},${temp.dg_fd_price3},${temp.dg_fd_price4},${temp.dg_fd_price5}],`
      dg_full_tariff += `[${temp.dg_slab_price0},${temp.dg_slab_price1},${temp.dg_slab_price2},${temp.dg_slab_price3},${temp.dg_slab_price4},${temp.dg_slab_price5}],`
      dg_full_tariff += `[${temp.dg_slab_energy0},${temp.dg_slab_energy1},${temp.dg_slab_energy2},${temp.dg_slab_energy3},${temp.dg_slab_energy4}]`
    }

    params.site_id = props.site.value
    params.grid_id = props.row[0][0].grid_id
    params.meter_detail = JSON.stringify(selected.all)
    params.eb_main_meter = temp.eb_main_meter
    params.eb_price = ebPrice
    params.eb_full_tariff = eb_full_tariff
    if (Object.keys(resp[1]).length) {
      params.dg_main_meter = temp.dg_main_meter
      params.dg_price = dgPrice
      params.dg_full_tariff = dg_full_tariff
    }
    params.updated_by = userEmail
    params.is_dual_source = Object.keys(resp[1]).length ? '1' : '0'

    const [statusCode, response] = await postEbDgMeter(params)

    if (statusCode === 201) {
      const resp = response.data.data.result

      MySwal.fire({
        icon: resp.escaped.length || resp.pending.length ? 'warning' : 'success',
        title: resp.escaped.length || resp.pending.length ? 'Please notice!' : 'Success',
        html: `
          ${resp.added.length ? `<b>Added</b>: ${JSON.stringify(resp.added).replace('[', '').replace(']', '')} <br><br>` : ''}
          ${resp.updated.length ? `<b>Updated</b>: ${JSON.stringify(resp.updated).replace('[', '').replace(']', '')} <br><br>` : ''}
          ${resp.pending.length ? `<b>Under process</b>: ${JSON.stringify(resp.pending).replace('[', '').replace(']', '')} <br><br>` : ''}
          ${resp.escaped.length ? `<b>Tariff not set to meter</b>: ${JSON.stringify(resp.escaped).replace('[', '').replace(']', '')} <br><br>` : ''}
          ${resp.message ? `${resp.message}` : ''}
        `,
        customClass: {
          confirmButton: 'btn btn-success'
        }
      })
      props.retry()
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

  const data = resp && Object.keys(resp[1]).length ? [
    {
      title: (<h4 className='w-100 pl-1'>EB Meter Tariff</h4>),
      content: (<Row> <CreateFormField fields={fields_eb} /> </Row>)
    },
    {
      title: (<h4 className='w-100 pl-1'>DG Meter Tariff</h4>),
      content: (<Row> <CreateFormField fields={fields_dg} /> </Row>)
    }
  ] : [
    {
      title: (<h4 className='w-100 pl-1'>EB Meter Tariff</h4>),
      content: (<Row> <CreateFormField fields={fields_eb} /> </Row>)
    }
  ]

  return <>
    {
      props.type === 'view' ? <p>Tariff view for Meter <b>{props.viewRow.meter_ip}</b> </p> :
        <>
          {selected.update && <p className='m-0'><b>{selected.update.split(',').length - 1}</b> {(selected.update.split(',').length - 1) > 1 ? 'Meters are' : 'Meter is'} selected to update tariff : &nbsp; <b>{selected.update}</b></p>}
          {selected.add && <p className='m-0'> <b>{selected.add.split(',').length - 1}</b> {(selected.add.split(',').length - 1) > 1 ? 'Meters are' : 'Meter is'} selected to add tariff : &nbsp; <b>{selected.add}</b></p>}
        </>
    }

    <Form id='tariffForm' className='mt-2'>
      {viewRow && <AppCollapse data={data} active={[0]} />}

      <Row>
        <Col xs='12' className='text-center pb-1 pt-2'>
          <Button color='primary' onClick={handleFormSubmit} disabled={(spiner || !selected.all || props.type === 'view') && true}>
            Set Tariff &nbsp; &nbsp; {spiner && <Spinner size='sm' />}
          </Button>
        </Col>
      </Row>
    </Form>
  </>
}

export default TariffForm