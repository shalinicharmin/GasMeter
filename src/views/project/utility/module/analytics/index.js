import { useState, useEffect } from 'react'
// ** Styles
import '@styles/react/libs/charts/apex-charts.scss'
import AssetAnalyticsReport from './assetAnalyticsReport'
import DtrReportsSection from './wrappers/siteAnalyticWrapper/dtrReportsSection'

import useJwt from '@src/auth/jwt/useJwt'
import jwt_decode from 'jwt-decode'
import Loader from '@src/views/project/misc/loader'
import CardInfo from '@src/views/ui-elements/cards/actions/cardInfo'
// import { useLocation } from 'react-router-dom'
import authLogout from '../../../../../auth/jwt/logoutlogic'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'

import { handleCurrentSelectedModuleStatus } from '@store/actions/Misc/currentSelectedModuleStatus'

const AnalyticsUtility = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const location = useLocation()

  const [projectLevel, setProjectLevel] = useState(1)

  // Logout User
  const [logout, setLogout] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [hasError, setError] = useState(false)
  const [retry, setRetry] = useState(true)
  const [resp, setResp] = useState('')

  // const pss_list = []
  const [pssList, setPssList] = useState([])
  const [feederList, setFeederList] = useState([])
  const [dtrList, setDtrList] = useState([])

  const [projectLevelReportAccess, setProjectLevelReportAccess] = useState(undefined)
  const [pssLevelReportAccess, setPssLevelReportAccess] = useState(undefined)
  const [dtrLevelReportAccess, setDtrLevelReportAccess] = useState(undefined)
  const [feederLevelReportAccess, setFeederLevelReportAccess] = useState(undefined)

  const [assetRowSelected, setAssetRowSelected] = useState(undefined)

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
      setProjectLevel(1)
    }
  }

  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const getReports = async params => {
    return await useJwt
      .getUserReportData(params)
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

  useEffect(async () => {
    if (retry) {
      const token_data = jwt_decode(localStorage.getItem('accessToken'))
      const [statusCode, response] = await getReports({ email: token_data['username'] }) //Fetch Reports Access List

      if (statusCode === 200) {
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
          setResp(response.data.data.result[0]['report_access']) //Set Report Access Response

          const resp_temp = response.data.data.result[0]['report_access']

          const tempProjectReports = []
          const tempPssReports = []
          const tempFeederReports = []
          const tempSiteReports = []

          const projectName = location.pathname.split('/')

          for (const project of resp_temp) {
            if (project['project'].toLowerCase() === projectName[2] && project['vertical'].toLowerCase() === projectName[1]) {
              for (const row of project['report_access']) {
                // console.log(row)
                if (row['report_type'] === 'Project') {
                  tempProjectReports.push(row)
                } else if (row['report_type'] === 'DTR') {
                  tempSiteReports.push(row)
                } else if (row['report_type'] === 'Substation') {
                  tempPssReports.push(row)
                } else if (row['report_type'] === 'Feeder') {
                  tempFeederReports.push(row)
                }
              }
            }
          }

          setProjectLevelReportAccess(tempProjectReports)
          setPssLevelReportAccess(tempPssReports)
          setFeederLevelReportAccess(tempFeederReports)
          setDtrLevelReportAccess(tempSiteReports)

          setRetry(false)

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
        } else if (statusCode1 === 401 || statusCode1 === 403) {
          setLogout(true)
        } else {
          // console.log('Internet Not Available 1.....')

          setRetry(false)
          setError(true)
          setErrorMessage('Network Error, please retry')
        }
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else {
        // console.log('Internet Not Available 2.....')

        setRetry(false)
        setError(true)
        setErrorMessage('Network Error, please retry')
      }
    }
  }, [retry])

  const updateProjectLevel = (reportIndex, rowCicked) => {
    // console.log('Row Clicked .....')
    // console.log(rowCicked)
    setProjectLevel(reportIndex)
    setAssetRowSelected(rowCicked)
  }

  const reportPanel = () => {
    if (projectLevel === 1 && projectLevelReportAccess) {
      // Project Level
      return (
        <AssetAnalyticsReport
          updateProjectLevel={updateProjectLevel}
          resp={resp}
          dtr_list={dtrList}
          pss_list={pssList}
          feeder_list={feederList}
          projectLevelReportAccess={projectLevelReportAccess}
          pssLevelReportAccess={pssLevelReportAccess}
          feederLevelReportAccess={feederLevelReportAccess}
          dtrLevelReportAccess={dtrLevelReportAccess}
        />
      )
    } else if (projectLevel === 2 && projectLevelReportAccess) {
      // PSS Level
    } else if (projectLevel === 3 && projectLevelReportAccess) {
      // Feeder Level
    } else if (projectLevel === 4 && projectLevelReportAccess) {
      // DTR Level
      return <DtrReportsSection updateProjectLevel={updateProjectLevel} dtrLevelReportAccess={dtrLevelReportAccess} dtrSelected={assetRowSelected} />
    } else {
      return <></>
    }
  }

  const retryAgain = () => {
    setError(false)
    setRetry(true)
  }

  return (
    <>
      {hasError ? (
        <CardInfo props={{ message: { errorMessage }, retryFun: { retryAgain }, retry: { retry } }} />
      ) : retry ? (
        <Loader hight='min-height-330' />
      ) : (
        reportPanel()
      )}
    </>
  )
}

export default AnalyticsUtility
