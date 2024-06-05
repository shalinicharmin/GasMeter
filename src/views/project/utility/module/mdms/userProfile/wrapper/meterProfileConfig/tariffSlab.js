import { useEffect, useState } from 'react'
import { FormGroup, Row, Col, Input, Form, Button, Label } from 'reactstrap'
import Select from 'react-select'

import Repeater from '@components/repeater'
import { X, Plus } from 'react-feather'
import { SlideDown } from 'react-slidedown'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import useJwt from '@src/auth/jwt/useJwt'
import Loader from '@src/views/project/misc/loader'

import { useDispatch, useSelector } from 'react-redux'

import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'

import { useLocation, useHistory } from 'react-router-dom'
import authLogout from '../../../../../../../../auth/jwt/logoutlogic'

const MySwal = withReactContent(Swal)

const TariffSlab = props => {
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

  const [count, setCount] = useState(1)
  const [val, setVal] = useState()
  const [isEditable, setIsEditable] = useState(false)
  const [phase, setPhase] = useState()
  const [unit, setUnit] = useState()

  const [FinalRecord, setFinalRecord] = useState(undefined)
  const [updateTariffCategory, setUpdateTariffCategory] = useState(false)

  const fetchData = async params => {
    return await useJwt
      .getMDMSUserTariffSlabData(params)
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

  const submitUpdatedTariffCategory = async params => {
    return await useJwt
      .putTariffCategory(params)
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

  const increaseCount = () => {
    setCount(count + 1)
  }

  const deleteForm = e => {
    e.preventDefault()
    const slideDownWrapper = e.target.closest('.react-slidedown'),
      form = e.target.closest('form')
    if (slideDownWrapper) {
      slideDownWrapper.remove()
    } else {
      // form.remove()
    }
  }

  const formSubmitHandler = e => {
    e.preventDefault()
    const [obj, finalRecord, totalRepeat] = [{}, { slab: [] }, []]
    const formData = new FormData(document.getElementById('slabForm'))
    let [flag, previousRepeatNumber] = [false, 0]

    // console.log('Form Data ....')
    // console.log(formData)

    formData.forEach((value, key) => {
      if (!value) {
        MySwal.fire({
          title: 'Please notice!',
          text: `${key} will not be empty!`,
          icon: 'warning'
        })

        flag = true
      } else {
        obj[key] = value

        if (key.indexOf('_') > -1) {
          if (key.split('_')[0] === 'startUnit') {
            totalRepeat.push(key.split('_')[1])
          }
        } else {
          finalRecord[key] = value
        }
      }
    })

    for (const i of totalRepeat) {
      if (parseFloat(obj[`startUnit_${i}`]) > parseFloat(obj[`endUnit_${i}`])) {
        MySwal.fire({
          title: 'Please notice!',
          text: `Start unit should not be greator then end unit. (at slab ${finalRecord['slab'].length + 1})`,
          icon: 'warning'
        })
        flag = true
      }
      if (finalRecord['slab'].length > 0 && parseFloat(obj[`startUnit_${i}`]) < parseFloat(obj[`endUnit_${previousRepeatNumber}`])) {
        MySwal.fire({
          title: 'Please notice!',
          text: `Start unit should not be less then previous slab end unit. (at slab ${finalRecord['slab'].length + 1})`,
          icon: 'warning'
        })
        flag = true
      }
      finalRecord['slab'].push({
        startUnit: obj[`startUnit_${i}`],
        endUnit: obj[`endUnit_${i}`],
        actualCharge: obj[`actualCharge_${i}`],
        charges: obj[`charges_${i}`]
      })
      previousRepeatNumber = i
    }

    if (flag) {
      return false
    }

    // console.log('Final Record')
    // console.log(finalRecord)
    setFinalRecord(finalRecord)
    setUpdateTariffCategory(true)
  }

  useEffect(async () => {
    const params = {
      project: HierarchyProgress.project_name,
      sc_no: HierarchyProgress.user_name
    }

    const [statusCode, response] = await fetchData(params)

    if (statusCode === 200) {
      if (response.data.data.result.stat.length > 0) {
        setVal(response.data.data.result.stat[0])
        setCount(response.data.data.result.stat[0]['slab'].length)
        setPhase({ label: response.data.data.result.stat[0].phase, value: response.data.data.result.stat[0].phase })
        setUnit({ label: response.data.data.result.stat[0].fixedDemandUnit, value: response.data.data.result.stat[0].fixedDemandUnit })

        if (response.data.data.result.stat[0]['is_editable'] === 0) {
          setIsEditable(false)
        } else {
          setIsEditable(true)
        }
      } else {
        setVal()
        setCount(1)
        setIsEditable(true)
      }
    } else if (statusCode === 401 || statusCode === 403) {
      setLogout(true)
    }
  }, [])

  useEffect(async () => {
    if (updateTariffCategory && FinalRecord) {
      const params = {
        project: HierarchyProgress.project_name,
        sc_no: HierarchyProgress.user_name,
        Tariffdata: FinalRecord
      }

      const [statusCode, response] = await submitUpdatedTariffCategory(params)

      // console.log('Status Code ...')
      // console.log(statusCode)

      // console.log('Response ...')
      // console.log(response)
      setUpdateTariffCategory(false)
      if (statusCode === 200) {
        toast.success(<Toast msg='Tariff Category updated successfully.' type='success' />, { hideProgressBar: true })
        props.setIsOpen(!props.isOpen)
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      } else {
        toast.error(<Toast msg='Fail to update the tariff category' type='danger' />, { hideProgressBar: true })
      }
    }
  }, [updateTariffCategory])

  const insertVal = (index, id) => {
    try {
      return val && val['slab'][index][id]
    } catch (err) {}
  }

  return (
    <Form id='slabForm'>
      <Row className='mb-1'>
        <Col md='6'>
          <FormGroup>
            <Label for='catName'>Category Name</Label>
            <Input
              disabled={isEditable ? '' : 'disabled'}
              type='text'
              name='catName'
              id='catName'
              defaultValue={val && val['catName']}
              placeholder='Category Name'
              required
            />
          </FormGroup>
        </Col>
      </Row>
      <p className='text_hr'>Meter rent Per Day</p>
      <Row className='mb-1'>
        <Col md='4'>
          <FormGroup>
            <Label for='phase'>Select phase</Label>
            <Select
              id='phase'
              name='phase'
              isClearable={true}
              closeMenuOnSelect={true}
              isSearchable={true}
              options={[
                {
                  label: '1-Ph',
                  value: '1-Ph'
                },
                {
                  label: '3-Ph',
                  value: '3-Ph'
                }
              ]}
              value={phase}
              onChange={setPhase}
              className='react-select rounded'
              classNamePrefix='select'
              placeholder='Select phase ...'
            />
          </FormGroup>
        </Col>
        <Col md='4'>
          <FormGroup>
            <Label for='meterRentPerDay'>Base price(₹)</Label>
            <Input
              disabled={isEditable ? '' : 'disabled'}
              type='number'
              pattern='[0-9]*'
              name='meterRentPerDay'
              id='meterRentPerDay'
              defaultValue={val && val['meterRentPerDay']}
              placeholder='Base price(₹)'
            />
          </FormGroup>
        </Col>
        <Col md='4'>
          <FormGroup>
            <Label for='meterRentSubsidy'>Subsidised price(₹)</Label>
            <Input
              disabled={isEditable ? '' : 'disabled'}
              type='number'
              name='meterRentSubsidy'
              id='meterRentSubsidy'
              defaultValue={val && val['meterRentSubsidy']}
              placeholder='Subsidised Price(₹)'
            />
          </FormGroup>
        </Col>
      </Row>
      <p className='text_hr'>Fixed Deduction per unit load per day</p>
      <Row className='mb-1'>
        <Col md='4'>
          <FormGroup>
            <Label for='fixedDemandPerLoadPerDay'>Fixed Deduction(₹)</Label>
            <Input
              disabled={isEditable ? '' : 'disabled'}
              type='number'
              name='fixedDemandPerLoadPerDay'
              id='fixedDemandPerLoadPerDay'
              defaultValue={val && val['fixedDemandPerLoadPerDay']}
              placeholder='Fixed deduction(₹)'
            />
          </FormGroup>
        </Col>
        <Col md='4'>
          <FormGroup>
            <Label for='fixedDemandUnit'>Unit</Label>
            <Select
              id='fixedDemandUnit'
              name='fixedDemandUnit'
              isClearable={true}
              closeMenuOnSelect={true}
              isSearchable={true}
              value={unit}
              onChange={setUnit}
              options={[
                {
                  label: 'kW',
                  value: 'kW'
                },
                {
                  label: 'kVA',
                  value: 'kVA'
                }
              ]}
              className='react-select rounded'
              classNamePrefix='select'
              placeholder='Select fixedDemandUnit ...'
            />
          </FormGroup>
        </Col>
        <Col md='4'>
          <FormGroup>
            <Label for='fixedDemandSubsidy'>Subsidised Price(₹)</Label>
            <Input
              disabled={isEditable ? '' : 'disabled'}
              type='number'
              name='fixedDemandSubsidy'
              id='fixedDemandSubsidy'
              defaultValue={val && val['fixedDemandSubsidy']}
              placeholder='Subsidised Price(₹)'
            />
          </FormGroup>
        </Col>
      </Row>
      <p className='text_hr'>Meter Tariff Slab</p>
      <Repeater count={count}>
        {i => {
          const Tag = i === 0 ? 'div' : SlideDown
          return (
            <Tag key={i}>
              <Row className='justify-content-between align-items-center'>
                <Col md='3'>
                  <FormGroup>
                    <Label for={`startUnit_${i}`}>Start Unit(kWh)</Label>
                    <Input
                      disabled={isEditable ? '' : 'disabled'}
                      type='number'
                      name={`startUnit_${i}`}
                      id={`startUnit_${i}`}
                      defaultValue={insertVal(i, 'startUnit')}
                      placeholder='Start Unit(kWh)'
                    />
                  </FormGroup>
                </Col>
                <Col md='3'>
                  <FormGroup>
                    <Label for={`endUnit_${i}`}>End Unit(kWh)</Label>
                    <Input
                      disabled={isEditable ? '' : 'disabled'}
                      type='text'
                      name={`endUnit_${i}`}
                      id={`endUnit_${i}`}
                      defaultValue={insertVal(i, 'endUnit')}
                      placeholder='End Unit(kWh)'
                    />
                  </FormGroup>
                </Col>
                <Col md='3'>
                  <FormGroup>
                    <Label for={`actualCharge_${i}`}>Unit Price(₹)</Label>
                    <Input
                      disabled={isEditable ? '' : 'disabled'}
                      type='number'
                      name={`actualCharge_${i}`}
                      id={`actualCharge_${i}`}
                      defaultValue={insertVal(i, 'actualCharge')}
                      placeholder='Unit Price (₹)'
                    />
                  </FormGroup>
                </Col>
                <Col md='2'>
                  <FormGroup>
                    <Label for={`charges_${i}`}>Subsidised Price(₹)</Label>
                    <Input
                      disabled={isEditable ? '' : 'disabled'}
                      type='number'
                      name={`charges_${i}`}
                      id={`charges_${i}`}
                      defaultValue={insertVal(i, 'charges')}
                      placeholder='Subsidised Price(₹)'
                    />
                  </FormGroup>
                </Col>
                <Col md='1'>
                  {val && i < val['slab'].length ? '' : <X size={18} className='mr-50 cursor-pointer text-danger' onClick={deleteForm} />}
                </Col>
                <Col sm={12}>
                  <hr />
                </Col>
              </Row>
            </Tag>
          )
        }}
      </Repeater>
      <Row className={val ? (isEditable ? '' : 'd-none') : ''}>
        <Col>
          <Button.Ripple className='mr-1' color='primary' type='submit' size='sm' onClick={e => formSubmitHandler(e)}>
            Submit
          </Button.Ripple>
        </Col>
        <Col>
          <Button.Ripple className='btn-icon float-right' size='sm' color='primary' onClick={increaseCount} outline>
            <Plus size={14} />
            <span className='align-middle ml-25'>Add New</span>
          </Button.Ripple>
        </Col>
      </Row>
    </Form>
  )
}

export default TariffSlab
