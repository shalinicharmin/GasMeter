import AlertCard from '@src/views/ui-elements/cards/gpCards/alertCard'
import { Row, Col } from 'reactstrap'

import { useContext, useState, useEffect } from 'react'

import { useSelector, useDispatch } from 'react-redux'

import { handleAlertsData as handlePssData } from '@store/actions/UtilityProject/MDMS/pss'
import { handleAlertsData as handleFeederData } from '@store/actions/UtilityProject/MDMS/feeder'
import { handleAlertsData as handleDtrData } from '@store/actions/UtilityProject/MDMS/dtr'
import { handleAlertsData as handleUserData } from '@store/actions/UtilityProject/MDMS/user'

import Loader from '@src/views/project/misc/loader'

import useJwt from '@src/auth/jwt/useJwt'

import { useLocation, useHistory } from 'react-router-dom'
import authLogout from '../../../../../../auth/jwt/logoutlogic'

const TopAlertsWrapper = props => {
  const dispatch = useDispatch()
  const history = useHistory()

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const HierarchyProgress = useSelector(state => state.UtilityMDMSHierarchyProgressReducer.responseData)
  const selected_month = useSelector(state => state.calendarReducer.month)

  let response, callAPI, responseData

  if (props.hierarchy === 'pss') {
    response = useSelector(state => state.UtilityMdmsPssAlertsReducer)
  } else if (props.hierarchy === 'feeder') {
    response = useSelector(state => state.UtilityMdmsFeederAlertsReducer)
  } else if (props.hierarchy === 'dtr') {
    response = useSelector(state => state.UtilityMdmsDtrAlertsReducer)
  } else if (props.hierarchy === 'user') {
    response = useSelector(state => state.UtilityMdmsUserAlertsReducer)
  }

  if (response && response.responseData) {
    responseData = response.responseData
  } else {
    responseData = []
  }

  const fetchData = async params => {
    return await useJwt
      .getHierarchyWiseAlertsMDMSModule(params)
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
    if (!response || response.callAPI) {
      // const data = {
      //   title: 'Aug 21 Uptime',
      //   statistics: '95%',
      //   series: [
      //     {
      //       data: [0, 20, 5, 30, 15, 45]
      //     }
      //   ]
      // }
      //Call API and check response and dispatch
      if (props.hierarchy === 'pss') {
        const params = {
          project: HierarchyProgress.project_name,
          year: selected_month.year,
          month: selected_month.month
        }

        const [statusCode, response] = await fetchData(params)
        if (statusCode) {
          if (statusCode === 200) {
            dispatch(handlePssData(response.data.data.result.stat))
            //dispatch(handlePssData(data))
          } else if (statusCode === 401 || statusCode === 403) {
            setLogout(true)
          }
        }
      } else if (props.hierarchy === 'feeder') {
        const params = {
          project: HierarchyProgress.project_name,
          substation: HierarchyProgress.pss_name,
          year: selected_month.year,
          month: selected_month.month
        }

        const [statusCode, response] = await fetchData(params)
        if (statusCode) {
          if (statusCode === 200) {
            dispatch(handleFeederData(response.data.data.result.stat))
          } else if (statusCode === 401 || statusCode === 403) {
            setLogout(true)
          }
        }
      } else if (props.hierarchy === 'dtr') {
        const params = {
          project: HierarchyProgress.project_name,
          substation: HierarchyProgress.pss_name,
          feeder: HierarchyProgress.feeder_name,
          year: selected_month.year,
          month: selected_month.month
        }

        const [statusCode, response] = await fetchData(params)
        if (statusCode) {
          if (statusCode === 200) {
            dispatch(handleDtrData(response.data.data.result.stat))
          } else if (statusCode === 401 || statusCode === 403) {
            setLogout(true)
          }
        }
      } else if (props.hierarchy === 'user') {
        const params = {
          project: HierarchyProgress.project_name,
          substation: HierarchyProgress.pss_name,
          feeder: HierarchyProgress.feeder_name,
          dtr: HierarchyProgress.dtr_name,
          year: selected_month.year,
          month: selected_month.month
        }

        const [statusCode, response] = await fetchData(params)
        if (statusCode) {
          if (statusCode === 200) {
            dispatch(handleUserData(response.data.data.result.stat))
          } else if (statusCode === 401 || statusCode === 403) {
            setLogout(true)
          }
        }
      }
    }
  }, [response])

  return (
    <Col>
      {response && !response.callAPI && <AlertCard data={responseData} height={props.height} />}
      {(!response || response.callAPI) && <Loader hight={props.loaderHeight ? props.loaderHeight : 'min-height-158'} />}
    </Col>
  )
}

export default TopAlertsWrapper
