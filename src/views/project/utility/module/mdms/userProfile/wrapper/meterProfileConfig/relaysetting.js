import { Button, InputGroup, InputGroupAddon, Input, FormGroup, Row, Col } from 'reactstrap'
import { useState, useEffect } from 'react'
import Select from 'react-select'

import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import useJwt from '@src/auth/jwt/useJwt'

import { useDispatch, useSelector } from 'react-redux'

import { handleConsumerTotalRechargesData } from '@store/actions/UtilityProject/MDMS/userprofile'

import { useLocation, useHistory } from 'react-router-dom'
import authLogout from '../../../../../../../../auth/jwt/logoutlogic'

const RelaySetting = props => {
  const dispatch = useDispatch()
  const history = useHistory()

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const [rechargeValue, setRechargeValue] = useState(0)
  const [rechargeMeter, setRechargeMeter] = useState(false)
  const [RelayDisconnectionCondition, setRelayDisconnectionCondition] = useState(undefined)
  const [SubmitCondition, setSubmitCondition] = useState(false)

  const [showSalientFeatures, setShowSalientFeatures] = useState(undefined)

  const HierarchyProgress = useSelector(state => state.UtilityMDMSHierarchyProgressReducer.responseData)
  // console.log('Relay Setting')
  // console.log(HierarchyProgress)

  if (!showSalientFeatures) {
    if (HierarchyProgress.dtr_name === 'S2_AVON METERS_hemantuser_20220510_115327') {
      setShowSalientFeatures(1)
    } else {
      setShowSalientFeatures(2)
    }
  }

  const updateRelayDisconnectionCondition = async params => {
    return await useJwt
      .updateRelayDisconnectionCondition(params)
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
    if (SubmitCondition) {
      const params = {
        project: HierarchyProgress.project_name,
        sc_no: HierarchyProgress.user_name,
        condition: RelayDisconnectionCondition
      }

      const [statusCode, response] = await updateRelayDisconnectionCondition(params)

      if (statusCode === 200) {
        toast.success(<Toast msg='Relay Disconnection condition submited ....' type='success' />, { hideProgressBar: true })
        props.setIsOpen(!props.isOpen)
        setSubmitCondition(false)
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else {
        toast.error(<Toast msg='Something went wrong please retry' type='danger' />, { hideProgressBar: true })
      }
    }
    // if (SubmitCondition) {
    //   toast.success(<Toast msg='Relay Disconnection condition submited ....' type='success' />, { hideProgressBar: true })
    //   props.setIsOpen(!props.isOpen)
    //   setSubmitCondition(false)
    // }
  }, [SubmitCondition])

  const handleButtonClick = () => {
    // console.log('Recharge Value Entered ...')
    // console.log(rechargeValue)

    if (!RelayDisconnectionCondition) {
      toast.error(<Toast msg='Select Option' type='danger' />, { hideProgressBar: true })
    } else {
      setSubmitCondition(true)
    }
  }

  const onRelayDisconnectionConditionSelected = value => {
    if (value) {
      // console.log(value)
      setRelayDisconnectionCondition(value.value)

      if (value.value === 'disconnect_as_default_utility') {
        setShowSalientFeatures(2)
      } else if (value.value === 'disconnect_as_soon_as_negative_balance') {
        setShowSalientFeatures(1)
      }
    } else {
      setRelayDisconnectionCondition(undefined)
      setShowSalientFeatures(undefined)
    }
  }

  return (
    <Row>
      {/* <Col sm='10'>
        <Select
          id='phase'
          name='phase'
          isClearable={true}
          closeMenuOnSelect={true}
          isSearchable={true}
          options={[
            {
              label: 'Disconnect as Default utility ',
              value: 'disconnect_as_default_utility'
            },
            {
              label: 'Disconnect as soon as negative balance ',
              value: 'disconnect_as_soon_as_negative_balance'
            }
          ]}
          // value={phase}
          onChange={onRelayDisconnectionConditionSelected}
          className='react-select rounded'
          classNamePrefix='select'
          placeholder='Select condition ...'
        />
      </Col> */}
      {/* <Col>
        <Button disabled color='secondary' outline onClick={handleButtonClick}>
          Update
        </Button>
      </Col> */}
      {showSalientFeatures && showSalientFeatures === 1 && (
        <Col>
          <h5>Negative Balance Disconnection Logic</h5>
          <ul>
            <li>Meter relay will be disconnected for negative balance between 10:00 AM to 01:00 PM</li>
          </ul>
        </Col>
      )}
      {showSalientFeatures && showSalientFeatures === 2 && (
        <Col>
          <h5>Utility Disconnection Logic</h5>
          <ul>
            <li>After meter commission meter will be disconnected after sending meter disconnection notice to consumer on its mobile number</li>
            <li>maximum negative balance of negative ₹ 250 is allowed</li>
            <li>Meter relay will be disconnected between 10:00 AM to 01:00 PM</li>
            <li>Meter relay will not be disconnected on national holidays and sunday unless requested by utility</li>
          </ul>
        </Col>
      )}
    </Row>
  )
}

export default RelaySetting
