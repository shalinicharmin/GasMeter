import React, { useState, useEffect } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  FormGroup,
  Col,
  Input,
  Form,
  Button,
  CustomInput,
  Label,
  Modal,
  ModalHeader,
  ModalBody
} from 'reactstrap'
import Select from 'react-select'
import { selectThemeColors } from '@utils'
import { useLocation, useHistory } from 'react-router-dom'
import ManuallyAddMeterForm from './manuallyAddMeterForm'
import useJwt from '@src/auth/jwt/useJwt'
import { toast } from 'react-toastify'
import Toast from '@src/views/ui-elements/cards/actions/createToast'
import { useDispatch, useSelector } from 'react-redux'
// import { useHistory } from 'react-router-dom'
import authLogout from '../../../../auth/jwt/logoutlogic'

import { handleCurrentSelectedModuleStatus } from '@store/actions/Misc/currentSelectedModuleStatus'

const ManuallyAddMeter = props => {
  const dispatch = useDispatch()
  const history = useHistory()

  const currentSelectedModuleStatus = useSelector(state => state.CurrentSelectedModuleStatusReducer.responseData)

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const [fetchingData, setFetchingData] = useState(true)
  const [createUserModal, setcreateUserModal] = useState(false)
  const [isTypingSite, setIsTypingSite] = useState(false)
  const [isSelection, setIsSelection] = useState(false)
  const [siteNameTyped, setSiteNameTyped] = useState(undefined)
  const [siteNameSelected, setSiteNameSelected] = useState({})
  const [siteNameOptions, setSiteNameOptions] = useState(undefined)
  const [pss_id, setPss_id] = useState('')
  const [feeder_id, setFeeder_id] = useState('')
  const [selected_project, set_selected_project] = useState(undefined)

  // To get location
  const location = useLocation()
  const verticalName = location.pathname.split('/')[1]
  const projectName = location.pathname.split('/')[2] === 'sbpdcl' ? 'ipcl' : location.pathname.split('/')[2]

  if (currentSelectedModuleStatus.prev_project) {
    if (
      selected_project !== currentSelectedModuleStatus.project &&
      currentSelectedModuleStatus.prev_project !== currentSelectedModuleStatus.project
    ) {
      set_selected_project(currentSelectedModuleStatus.project)
      setFetchingData(true)
      props.setActive('1')
      setSiteNameSelected({})
    }
  }

  // Api to get meter list
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
    if (fetchingData) {
      const params = {}
      params['project'] = projectName
      params['vertical'] = verticalName

      const [statusCode, response] = await fetchAssetData(params) //Fetch Asset List
      // Create Data for Asset
      const pss_list = []
      const feeder_list = []
      const dtr_list = []
      if (statusCode) {
        if (statusCode === 200) {
          const data = response.data.data.result.stat

          // Create pss list
          // const pss_list = []
          for (const pss of data['pss_list']) {
            const temp = {}
            temp['pss_name'] = pss['pss_name']
            temp['pss_id'] = pss['pss_id']
            pss_list.push(temp)
          }

          // Create Feeder list
          // const feeder_list = []
          for (const feeder of data['feeder_list']) {
            const temp = {}
            const parent_pss = feeder['pss_id']
            for (const pss of pss_list) {
              if (pss['pss_id'] === parent_pss) {
                temp['feeder_name'] = feeder['feeder_name']
                temp['feeder_id'] = feeder['feeder_id']
                temp['pss_name'] = pss['pss_name']
                temp['pss_id'] = pss['pss_id']
                feeder_list.push(temp)
              }
            }
          }

          // Create DTR List
          // const dtr_list = []
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
        }
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      }

      setSiteNameOptions(dtr_list)
      setFetchingData(false)
    }
  }, [fetchingData])

  // on site selection handle change
  const onSiteHandleChange = e => {
    if (e) {
      setSiteNameSelected(e)
      setPss_id(e.pss_id)
      setFeeder_id(e.feeder_id)
      setSiteNameTyped(undefined)
      setIsTypingSite(true)
      setIsSelection(false)
    } else {
      setSiteNameSelected({})
      setSiteNameTyped(undefined)
      setIsSelection(false)
      setIsTypingSite(false)
    }
  }

  // on handle site input
  const onSiteInputName = e => {
    if (e.target.value) {
      setSiteNameTyped(e.target.value)
      setSiteNameSelected({})
      setIsSelection(true)
      setIsTypingSite(false)
    } else {
      setSiteNameTyped(undefined)
      setSiteNameSelected({})
      setIsSelection(false)
      setIsTypingSite(false)
    }
  }

  // form modal handle
  const handleCreateUserFormModal = () => setcreateUserModal(!createUserModal)

  return (
    <>
      <Card className='border-left'>
        <CardHeader className='m-0 pt-0'>
          <CardTitle tag='h4'>Site Selection</CardTitle>
        </CardHeader>

        <CardBody>
          <Form>
            <FormGroup row>
              <Label sm='3' for='name'>
                New site :
              </Label>
              <Col sm='9'>
                <Input
                  type='text'
                  name='siteName'
                  id='sitename'
                  placeholder='Enter Site Name'
                  value={siteNameTyped}
                  onChange={onSiteInputName}
                  disabled={isTypingSite}
                />
              </Col>
            </FormGroup>

            <div className='text-center m-2  text-dark'>
              <p> or</p>
            </div>
            <FormGroup row>
              <Label sm='3' for='Email'>
                Existing Site :
              </Label>
              <Col sm='9'>
                <Select
                  theme={selectThemeColors}
                  className='react-select'
                  classNamePrefix='select'
                  // defaultValue={colourOptions[1]}
                  name='clear'
                  value={siteNameSelected}
                  options={siteNameOptions}
                  onChange={onSiteHandleChange}
                  isClearable
                  maxMenuHeight={250}
                  placeholder='Select Site..'
                  isDisabled={isSelection}
                />
              </Col>
            </FormGroup>

            <FormGroup className='mb-0 float-right' row>
              <Col>
                <Button.Ripple
                  className='mt-1  px-3'
                  color='primary'
                  type='submit'
                  onClick={e => {
                    e.preventDefault()
                    if (!siteNameTyped && !siteNameSelected.value) {
                      toast.warning(<Toast msg={'Enter Site Name or Select Site'} type='warning' />, { hideProgressBar: true })
                      return false
                    }
                    // if (!siteNameTyped) {
                    //   if (!siteNameSelected) {
                    //     toast.warning(<Toast msg={'Enter Site Name.'} type='warning' />, { hideProgressBar: true })
                    //     return false
                    //   }
                    // } else if (!siteNameSelected) {
                    //   if (!siteNameTyped) {
                    //     toast.warning(<Toast msg={'Select Site.'} type='warning' />, { hideProgressBar: true })
                    //     return false
                    //   }
                    // }
                    handleCreateUserFormModal()
                  }}>
                  Next
                </Button.Ripple>
              </Col>
            </FormGroup>
          </Form>
        </CardBody>
      </Card>
      <Modal isOpen={createUserModal} toggle={handleCreateUserFormModal} className='modal-dialog-centered modal-xl mb-0'>
        <ModalHeader toggle={handleCreateUserFormModal}>Manually Add Meter Form </ModalHeader>
        <ModalBody className=''>
          <ManuallyAddMeterForm
            siteId={siteNameSelected ? siteNameSelected : siteNameTyped}
            pssId={pss_id}
            feederId={feeder_id}
            handleCreateUserFormModal={handleCreateUserFormModal}
          />
        </ModalBody>
      </Modal>
    </>
  )
}

export default ManuallyAddMeter
