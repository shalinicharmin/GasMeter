import { Button, Col, Row, Modal, ModalHeader, ModalBody, Input } from 'reactstrap'
import Select from 'react-select'
import CreateTable from '@src/views/ui-elements/dtTable/createTable'
import { useState, useEffect } from 'react'
import useJwt from '@src/auth/jwt/useJwt'
import authLogout from '../../../../../../auth/jwt/logoutlogic'

import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'

const ConfiguredMeterList = props => {
  const dispatch = useDispatch()
  const history = useHistory()

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const [ConfiguredMeterList, setConfiguredMeterList] = useState([])

  const getMeterConfigurationList = async () => {
    return await useJwt
      .getMDasMeterConfigurationList()
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
    const [statusCode, response] = await getMeterConfigurationList()

    if (statusCode === 200) {
      setConfiguredMeterList(response.data.data.result)
      // props.closeMeterConfigurationModal()
      // toast.success(<Toast msg='Meter configured successfully.' type='success' />, { hideProgressBar: true })
    } else if (statusCode === 401 || statusCode === 403) {
      setLogout(true)
    } else {
      toast.error(<Toast msg='Failed to fetch Meter List' type='danger' />, { hideProgressBar: true })
    }
  }, [])

  // const tableData = [
  //   {
  //     id: '231d1e9b-6862-4c82-a717-6ff2fa0cad1b',
  //     meter: 300345,
  //     command: 'Block Load',
  //     execution_status: 'Failed',
  //     start_time: ' 05:01 PM, Feb 09, 2022',
  //     update_time: ' 05:02 PM, Feb 09, 2022'
  //   },
  //   {
  //     id: 'bd213607-03fc-413f-9b64-1dbd838048cc',
  //     meter: 300345,
  //     command: 'Block Load',
  //     execution_status: 'Success',
  //     start_time: ' 05:00 PM, Feb 09, 2022',
  //     update_time: ' 05:01 PM, Feb 09, 2022'
  //   },
  //   {
  //     id: 'b179664d-e7c9-4ccb-8a22-cb19e864216d',
  //     meter: 300345,
  //     command: 'Profile Instant',
  //     execution_status: 'Success',
  //     start_time: ' 02:31 PM, Feb 09, 2022',
  //     update_time: ' 02:31 PM, Feb 09, 2022'
  //   },
  //   {
  //     id: '94d43de4-42e3-4eed-bedb-b66213c5a241',
  //     meter: 300345,
  //     command: 'Block Load',
  //     execution_status: 'Failed',
  //     start_time: ' 02:29 PM, Feb 09, 2022',
  //     update_time: ' 02:30 PM, Feb 09, 2022'
  //   },
  //   {
  //     id: 'ace88ab4-f1b0-4c46-a5f3-71855ba748a9',
  //     meter: 300345,
  //     command: 'Daily Load',
  //     execution_status: 'Success',
  //     start_time: ' 06:40 PM, Feb 08, 2022',
  //     update_time: ' 06:40 PM, Feb 08, 2022'
  //   },
  //   {
  //     id: '48b05e14-4e99-4766-be04-88276fb66cad',
  //     meter: 300345,
  //     command: 'Profile Instant',
  //     execution_status: 'Success',
  //     start_time: ' 06:39 PM, Feb 08, 2022',
  //     update_time: ' 06:39 PM, Feb 08, 2022'
  //   },
  //   {
  //     id: '4548c19e-564e-4757-9f61-c9538b314b85',
  //     meter: 300345,
  //     command: 'Profile Instant',
  //     execution_status: 'Success',
  //     start_time: ' 06:32 PM, Feb 08, 2022',
  //     update_time: ' 06:35 PM, Feb 08, 2022'
  //   },
  //   {
  //     id: '7649f44a-f7ae-4d03-b310-b7dd9531608d',
  //     meter: 300345,
  //     command: 'Profile Instant',
  //     execution_status: 'Success',
  //     start_time: ' 04:04 PM, Feb 05, 2022',
  //     update_time: ' 05:31 PM, Feb 08, 2022'
  //   }
  // ]
  return <CreateTable data={ConfiguredMeterList} height='max' tableName='Configured meters list' />
}

export default ConfiguredMeterList
