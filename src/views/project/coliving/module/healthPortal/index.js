import React, { useState, useEffect } from 'react'

import { TabContent, TabPane, Nav, NavItem, NavLink, Col, Label, Row, Button, Spinner } from 'reactstrap'

import DcuHealthPortal from './dcuHealthPortal'
import DcuhealthTableReport from './dcuHealthTableReport'
import MeterHealthPortal from './meterHealthPortal'
import SiteHealthTableReport from './siteHealthTableReport'
import Select from 'react-select'
import { selectThemeColors } from '@utils'
import useJwt from '@src/auth/jwt/useJwt'
import jwt_decode from 'jwt-decode'
import authLogout from '../../../../../auth/jwt/logoutlogic'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'
import Loader from '@src/views/project/misc/loader'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
import { RefreshCcw, RefreshCw, Search } from 'react-feather'

import { handleCurrentSelectedModuleStatus } from '@store/actions/Misc/currentSelectedModuleStatus'

const HealthPortal = () => {
  const options = [
    { value: '1', label: 'Last 1 Hours' },
    { value: '2', label: 'Last 2 Hours' },
    { value: '4', label: 'Last 4 Hours' },
    { value: '6', label: 'Last 6 Hours' },
    { value: '8', label: 'Last 8 Hours' },
    { value: '10', label: 'Last 10 Hours' },
    { value: '12', label: 'Last 12 Hours' },
    { value: '16', label: 'Last 16 Hours' },
    { value: '24', label: 'Last 24 Hours' },
    { value: '48', label: 'Last 2 Days' },
    { value: '192', label: 'Last 8 Days' },
    { value: '360', label: 'Last 15 Days' },
    { value: '720', label: 'Last 30 days' }
  ]
  const [active, setActive] = useState('1')
  const [selectDownTime, setSelectDownTime] = useState(options[0])

  const [pssList, setPssList] = useState([])
  const [feederList, setFeederList] = useState([])
  const [dtrList, setDtrList] = useState([])
  const [siteList, setSiteList] = useState([])

  // Logout User
  const [logout, setLogout] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [hasError, setError] = useState(false)
  const [retry, setRetry] = useState(true)
  const [resp, setResp] = useState('')

  const dispatch = useDispatch()
  const history = useHistory()
  const location = useLocation()

  // const [selected_vertical,set_selected_vertical] = useState(undefined)
  const [selected_project, set_selected_project] = useState(undefined)
  const currentSelectedModuleStatus = useSelector(state => state.CurrentSelectedModuleStatusReducer.responseData)

  if (currentSelectedModuleStatus.prev_project) {
    if (
      selected_project !== currentSelectedModuleStatus.project &&
      currentSelectedModuleStatus.prev_project !== currentSelectedModuleStatus.project
    ) {
      set_selected_project(currentSelectedModuleStatus.project)
      setRetry(true)
      setError(false)
      setActive('1')
      setSiteList([])
      setSelectDownTime(options[0])
    }
  }

  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const toggle = tab => {
    if (active !== tab) {
      setActive(tab)
    }
  }

  // API Call to fetch DTR asset list
  const fetchAssetData = async params => {
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

  // Api to call fetch asset health count
  const fetchAssetHealthCount = async params => {
    return await useJwt
      .postAssetHealthCount(params)
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
    if (retry) {
      const token_data = jwt_decode(localStorage.getItem('accessToken'))

      // Fetch Asset List
      const params = {}
      let project = ''
      if (location.pathname.split('/')[2] === 'sbpdcl') {
        project = 'ipcl'
      } else {
        project = location.pathname.split('/')[2]
      }
      const vertical = location.pathname.split('/')[1]
      params['project'] = project
      params['vertical'] = vertical

      const [statusCode1, response1] = await fetchAssetData(params) //Fetch Asset List
      if (statusCode1 === 200) {
        const data = response1.data.data.result.stat

        // Create pss list
        const pss_list = []
        for (const pss of data['pss_list']) {
          const temp = {}
          temp['pss_name'] = pss['pss_name']
          temp['pss_id'] = pss['pss_id']
          temp['value'] = pss['pss_id']
          temp['label'] = pss['pss_name']

          pss_list.push(temp)
        }

        // Create Feeder list
        const feeder_list = []
        for (const feeder of data['feeder_list']) {
          const temp = {}
          const parent_pss = feeder['pss_id']
          for (const pss of pss_list) {
            if (pss['pss_id'] === parent_pss) {
              temp['feeder_name'] = feeder['feeder_name']
              temp['feeder_id'] = feeder['feeder_id']
              temp['label'] = feeder['feeder_name']
              temp['value'] = feeder['feeder_id']
              temp['pss_name'] = pss['pss_name']
              temp['pss_id'] = pss['pss_id']
              feeder_list.push(temp)
            }
          }
        }

        // Create DTR List
        const dtr_list = []
        for (const dtr of data['live_dt_list']) {
          const temp = {}
          const parent_feeder = dtr['feeder_id']
          for (const feeder of feeder_list) {
            if (feeder['feeder_id'] === parent_feeder) {
              temp['feeder_name'] = feeder['feeder_name']
              temp['feeder_id'] = feeder['feeder_id']
              temp['pss_name'] = feeder['pss_name']
              temp['pss_id'] = feeder['pss_id']
              temp['dtr_name'] = dtr['site_name']
              temp['dtr_id'] = dtr['site_id']
              temp['label'] = dtr['site_name']
              temp['value'] = dtr['site_id']
              temp['project'] = params.project
              dtr_list.push(temp)
            }
          }
        }

        setPssList(pss_list)
        setFeederList(feeder_list)
        setDtrList(dtr_list)
        // siteList
        const site_list = []
        for (const i of data.dt_list) {
          site_list.push(i.site_id)
        }

        setSiteList(site_list)

        let param = {}
        param = {
          siteId: site_list,
          downFactor: selectDownTime.value
        }

        const [statusCode, response] = await fetchAssetHealthCount(param)

        if (statusCode === 401 || statusCode === 403) {
          setLogout(true)
        } else if (statusCode === 200) {
          // Set Response Data
          setResp(response.data.data.result)

          setRetry(false)
        } else {
          setError(true)
          setRetry(false)

          setErrorMessage('Network Error, please retry')
        }
      } else if (statusCode1 === 401 || statusCode1 === 403) {
        setLogout(true)
      } else {
        setError(true)
        setRetry(false)

        setErrorMessage('Network Error, please retry')
      }
    }
  }, [retry])

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }

  const onHandleChange = e => {
    setRetry(true)
    setSiteList([])
    setSelectDownTime(e)
  }

  return (
    <>
      <Row className='mb-2'>
        <Col lg='6' md='12' sm='12'>
          <h4> Health Portal</h4>
        </Col>

        <Col lg='6' md='6' className=''>
          <div className='d-flex justify-content-end'>
            <h6 className='mt_9'> DownTime:- &nbsp;&nbsp;&nbsp; </h6>
            <Col lg='5'>
              <Select
                theme={selectThemeColors}
                className='react-select'
                classNamePrefix='select'
                // defaultValue={options[0]}
                value={selectDownTime}
                options={options}
                isClearable={false}
                onChange={e => {
                  onHandleChange(e)
                }}
              />
            </Col>
            <div className='d-flex justify-content-end align-items-center p_10'>
                <RefreshCw size={18} className='align-middle ml-sm-25 ml-0' onClick={retryAgain}/>
            </div>
          </div>
        </Col>
      </Row>

      {/* </Col> */}
      {/* </Row> */}

      <Row>
        <Col lg='6' md='6' xs='12'>
          <NavLink
            active={active === '1'}
            onClick={() => {
              toggle('1')
            }}>
            {hasError ? (
              <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
            ) : (
              <>{!retry ? <DcuHealthPortal active={active} response={resp} /> : <Loader hight='min-height-233' />}</>
            )}
          </NavLink>
        </Col>
        <Col lg='6' md='6' xs='12'>
          <NavLink
            active={active === '2'}
            onClick={() => {
              toggle('2')
            }}>
            {hasError ? (
              <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
            ) : (
              <>{!retry ? <MeterHealthPortal active={active} response={resp} /> : <Loader hight='min-height-233' />}</>
            )}
          </NavLink>
        </Col>
      </Row>
      <TabContent activeTab={active}>
        <TabPane tabId='1'>
          <DcuhealthTableReport siteList={siteList} downFactor={selectDownTime} />
        </TabPane>
        <TabPane tabId='2'>
          <SiteHealthTableReport siteList={siteList} downFactor={selectDownTime} />
        </TabPane>
      </TabContent>
    </>
  )
}

export default HealthPortal
