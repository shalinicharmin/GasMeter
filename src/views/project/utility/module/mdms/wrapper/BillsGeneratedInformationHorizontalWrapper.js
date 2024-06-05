import { Row, Col } from 'reactstrap'
import AnalyticSmallCard from '@src/views/ui-elements/cards/gpCards/analyticSmallCard'
import StatsHorizontal from '@components/widgets/stats/StatsHorizontal'
// String to icon tag
import IcoFun from '@src/utility/dynamicIcon'

import { ThemeColors } from '@src/utility/context/ThemeColors'
import { useContext, useState, useEffect } from 'react'

import { useSelector, useDispatch } from 'react-redux'

import { handleBillsGeneratedData as handlePssData } from '@store/actions/UtilityProject/MDMS/pss'
import { handleBillsGeneratedData as handleFeederData } from '@store/actions/UtilityProject/MDMS/feeder'
import { handleBillsGeneratedData as handleDtrData } from '@store/actions/UtilityProject/MDMS/dtr'
import { handleBillsGeneratedData as handleUserData } from '@store/actions/UtilityProject/MDMS/user'
import { handleCalendarMonthUpdated } from '@store/actions/navbar/calendar'

import Loader from '@src/views/project/misc/loader'
import useJwt from '@src/auth/jwt/useJwt'

import { useLocation, useHistory } from 'react-router-dom'
import authLogout from '../../../../../../auth/jwt/logoutlogic'

const BillsGeneratedWrapper = props => {
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

  // const dispatch = useDispatch()
  const [centeredModal, setCenteredModal] = useState(false)

  let response, callAPI, responseData

  if (props.hierarchy === 'pss') {
    response = useSelector(state => state.UtilityMdmsPssBillsGeneratedReducer)
  } else if (props.hierarchy === 'feeder') {
    response = useSelector(state => state.UtilityMdmsFeederBillsGeneratedReducer)
  } else if (props.hierarchy === 'dtr') {
    response = useSelector(state => state.UtilityMdmsDtrBillsGeneratedReducer)
  } else if (props.hierarchy === 'user') {
    response = useSelector(state => state.UtilityMdmsUserBillsGeneratedReducer)
  }

  if (response && response.responseData && response.responseData.length > 0) {
    responseData = response.responseData
  } else {
    responseData = [
      {
        value: '00',
        title: 'xx'
      }
    ]
  }

  // if (response && response.callAPI) {
  //   callAPI = callAPI
  // } else {
  //   callAPI = true
  // }

  const { colors } = useContext(ThemeColors)

  const fetchData = async params => {
    return await useJwt
      .getHierarchyWiseBillsGeneratedMDMSModule(params)
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
      //   title: 'Total Bills Generated',
      //   statistics: '75000',
      //   series: [
      //     {
      //       data: [0, 20, 5, 30, 15, 45]
      //     }
      //   ]
      // }

      //Call API and check response and dispatch
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

  const content_card = (
    <StatsHorizontal icon={IcoFun('FileText', 21)} color='warning' stats={responseData[0].value.toString()} statTitle={responseData[0].title} />
  )

  return (
    <Col>
      {response && !response.callAPI && content_card}
      {(!response || response.callAPI) && <Loader hight='min-height-158' />}
    </Col>
  )
}

export default BillsGeneratedWrapper
