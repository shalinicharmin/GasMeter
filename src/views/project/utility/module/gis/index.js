import { useEffect, useState } from 'react'
import { Button, Col, FormGroup, Input, Label, Row } from 'reactstrap'
import { useLocation } from 'react-router-dom'
import { selectThemeColors } from '@utils'
import Select from 'react-select'
import GoogleMapsWrapper from '@src/views/project/utility/module/gis/wrapper/googleMapsWrapper'

// ** Add New Modal Component
import MdmsWithGisSidebar from './wrapper/mdmsWithGisSidebar'
import FilterSidebar from './wrapper/filterSlider'
import MeterSearch from './wrapper/meterSearch'

import '@styles/react/libs/react-select/_react-select.scss'

import meter from '@src/assets/images/gp_icons/ic_meter_installed.png'
import meter_not_installed from '@src/assets/images/gp_icons/ic_meter_installed_no.png'
import pole from '@src/assets/images/gp_icons/ic_pole.png'
import dcu from '@src/assets/images/gp_icons/ic_dcu.png'
import repeater from '@src/assets/images/gp_icons/ic_repeater.png'
import filter from '@src/assets/images/gp_icons/ic_filter.png'
import mdas from '@src/assets/images/gp_icons/ic_mdas.png'
import mdms from '@src/assets/images/gp_icons/ic_mdms.png'
import transformer from '@src/assets/images/gp_icons/ic_dtr.png'

import {
  handleGISMapData,
  handleGISMapMarkerData,
  handleGISMapInitCenterData,
  handleGISMapPolyLineData,
  handleGISMapZoom,
  handleGISDTRSelected,
  handleGISMapUpdatedCenter
} from '@store/actions/UtilityProject/GIS/MapAsset'

import { useSelector, batch, useDispatch } from 'react-redux'

import { handleCurrentSelectedModuleStatus } from '@store/actions/Misc/currentSelectedModuleStatus'

const GisUtility = () => {
  const dispatch = useDispatch()
  const location = useLocation()

  // Observing GIS Map response data till DTR Level
  const response = useSelector(state => state.UtilityGISMapsReducer)

  // console.log('Response Data For Utility GIS Maps Reducer....')
  // console.log(response)

  const responseData = useSelector(state => state.UtilityMdmsFlowReducer)

  //Local State Management for Substation and Feeder list
  const [substation, setSubstation] = useState([])
  const [feeder, setFeeder] = useState([])
  const [dtr, setDtr] = useState([])

  //Store Selected Substation and Feeder Data
  const [selectedSubstation, setSelectedSubstation] = useState(null)
  const [selectedFeeder, setSelectedFeeder] = useState(null)
  const [selectedDTR, setSelectedDTR] = useState([])

  const [showPoleLabel, setShowPoleLabel] = useState(false)

  const response_selected_dtr_filter = useSelector(state => state.UtilityGISDTRFilterReducer)
  // console.log('Utility GIS DTR Filter Reducer .....')
  // console.log(response_selected_dtr_filter)

  const currentSelectedModuleStatus = useSelector(state => state.CurrentSelectedModuleStatusReducer.responseData)

  useEffect(() => {
    if (response_selected_dtr_filter) {
      setSelectedDTR(response_selected_dtr_filter.responseData)
    }
  }, [response_selected_dtr_filter])

  useEffect(() => {
    if (response && !response.callAPI) {
      // Populate Substation List for DropDown
      const DTR_Dropdown_list = []

      for (const _ele of response.responseData['live_dt_list']) {
        const temp_dtr = {}
        temp_dtr['value'] = _ele['site_id']
        temp_dtr['label'] = _ele['site_name']
        temp_dtr['isFixed'] = 'true'

        DTR_Dropdown_list.push(temp_dtr)
      }

      // if (responseData.responseData && responseData.responseData['user_flag'] === 'DTRLevel') {
      //   for (const _ele of response.responseData['live_dt_list']) {
      //     for (const _temp of responseData.responseData['dtr_list']) {
      //       if (_ele['site_id'] === _temp['id']) {
      //         const temp_dtr = {}
      //         temp_dtr['value'] = _ele['site_id']
      //         temp_dtr['label'] = _ele['site_name']
      //         temp_dtr['isFixed'] = 'true'

      //         DTR_Dropdown_list.push(temp_dtr)
      //       }
      //     }
      //   }
      // } else {
      //   for (const _ele of response.responseData['live_dt_list']) {
      //     const temp_dtr = {}
      //     temp_dtr['value'] = _ele['site_id']
      //     temp_dtr['label'] = _ele['site_name']
      //     temp_dtr['isFixed'] = 'true'

      //     DTR_Dropdown_list.push(temp_dtr)
      //   }
      // }

      setDtr(DTR_Dropdown_list)
    }
  }, [response, responseData])

  const [modal, setModal] = useState(false)
  const [filterModal, setFilterModal] = useState(false)

  // ** Function to handle Modal toggle
  const handleModal = () => setModal(!modal)
  const handleFilterModal = () => setFilterModal(!filterModal)

  // const location = useLocation()
  const projectName = location.pathname.split('/')[2] === 'sbpdcl' ? 'ipcl' : location.pathname.split('/')[2]

  //Slider Icon UseState
  const [sliderButtonVisibility, setSliderButtonVisibility] = useState(false)

  // Check If project is Changed
  const [selected_project, set_selected_project] = useState(undefined)
  // console.log('Current Selected Module Status .....')
  // console.log(currentSelectedModuleStatus)

  if (currentSelectedModuleStatus.prev_project) {
    if (
      selected_project !== currentSelectedModuleStatus.project &&
      currentSelectedModuleStatus.prev_project !== currentSelectedModuleStatus.project
    ) {
      set_selected_project(currentSelectedModuleStatus.project)
      setDtr([])
      setSelectedDTR([])
      setShowPoleLabel(false)
      setModal(false)
      setFilterModal(false)
      setSliderButtonVisibility(false)
    }
  }

  const updateSiderButtonVisibility = state => {
    if (sliderButtonVisibility && state) {
      //Do Nothing
    } else {
      setSliderButtonVisibility(!sliderButtonVisibility)
    }
  }

  const onDTRSelected = selectedOption => {
    //Update DTR State array on option selected
    setSelectedDTR(selectedOption)
  }

  const onUpdatedApplyButtonClicked = () => {
    //Updated Apply Button
    if (response && !response.callAPI) {
      const dt_list = response.responseData['live_dt_list']

      if (selectedDTR.length > 0) {
        const filtered_dt_list = []
        for (const _ele of selectedDTR) {
          for (const _dt of dt_list) {
            if (_ele['value'] === _dt['site_id']) {
              filtered_dt_list.push(_dt)
            }
          }
        }

        //2.Get Map Center
        const initMapCenter = { Lat: filtered_dt_list[0]['latitude'], Long: filtered_dt_list[0]['longitude'] }

        //Batching All Dispatches
        batch(() => {
          //2.Dispatch Markers Data
          dispatch(handleGISMapMarkerData(filtered_dt_list))

          //3.Dispatch Map Center Data
          dispatch(handleGISMapInitCenterData(initMapCenter))

          //4.Dispatch PolyLine Data
          dispatch(handleGISMapPolyLineData([]))

          // 5.Dispatch Selected DTR List
          dispatch(handleGISDTRSelected(selectedDTR))

          // ResetMapCenter
          dispatch(handleGISMapUpdatedCenter({ lat: filtered_dt_list[0]['latitude'], lng: filtered_dt_list[0]['longitude'] }))
        })
      } else {
        //If List empty Do nothing
        //1.Get All DTR Data
        const markers = response.responseData['live_dt_list']
        const feeder_list = response.responseData['feeder_list']
        for (const marker of markers) {
          marker['asset_type'] = 'DTR'
          marker['asset_name'] = marker['site_name']
          marker['asset_id'] = marker['site_id']
          marker['parent_feeder_id'] = marker['feeder_id']
          const _feeder_data = feeder_list.filter(function (item) {
            return item.feeder_id === marker['feeder_id']
          })
          if (_feeder_data.length > 0) {
            marker['parent_substation_id'] = _feeder_data[0].pss_id
          } else {
            marker['parent_substation_id'] = ''
          }
          marker['parent_dtr_id'] = ''
        }

        //2.Get Map Center
        const initMapCenter = { Lat: markers[0]['latitude'], Long: markers[0]['longitude'] }

        //Batching All Dispatches
        batch(() => {
          //1.Dispatch GIS Map Response Data
          // dispatch(handleGISMapData(data))

          //2.Dispatch Markers Data
          dispatch(handleGISMapMarkerData(markers))

          //3.Dispatch Map Center Data
          dispatch(handleGISMapInitCenterData(initMapCenter))

          // ResetMapCenter
          dispatch(handleGISMapUpdatedCenter({ lat: markers[0]['latitude'], lng: markers[0]['longitude'] }))

          //4.Dispatch PolyLine Data
          dispatch(handleGISMapPolyLineData([]))
        })
      }
    }
  }

  const onShowPoleLabelClicked = () => {
    setShowPoleLabel(!showPoleLabel)
  }

  return (
    <>
      <div className='forground'>
        <Row className='mb-1'>
          <Col className='mb_2 pr-0' xl='4' md='8' xs='9'>
            <Select
              isClearable={true}
              theme={selectThemeColors}
              closeMenuOnSelect={false}
              value={selectedDTR}
              onChange={onDTRSelected}
              isSearchable={true}
              isMulti={true}
              options={dtr}
              className='react-select border-secondary rounded'
              classNamePrefix='select'
              placeholder='Select DTR ...'
            />
          </Col>

          <Col className='mb_2 pl-0' md='1' xs='3'>
            <Button.Ripple className='btn' color='primary' onClick={onUpdatedApplyButtonClicked}>
              Apply
            </Button.Ripple>
          </Col>
          <Col className='mb_2' xl='4' sm='10'>
            <MeterSearch project={projectName} />
          </Col>
        </Row>
      </div>
      <div className='gis_resp'>
        <GoogleMapsWrapper
          project={projectName}
          updateSiderButtonVisibility={updateSiderButtonVisibility}
          selectedSubstation={selectedSubstation}
          handleModal={handleModal}
          showPoleLabel={showPoleLabel}
        />
      </div>

      {/* Right slider modal */}
      <MdmsWithGisSidebar open={modal} handleModal={handleModal} />

      {/* Left slider modal */}
      <FilterSidebar open={filterModal} handleModal={handleFilterModal} />

      {/*GIS left side Legends*/}
      <div className='left_side_legend_dv super-center'>
        <div className='legend'>
          <div className='legend_text'>DTR</div>
          <div className='legend_icon super-center'>
            <img className='mb_3 text-dark' src={transformer} />
          </div>
        </div>

        <div className='legend'>
          <div className='legend_text'>Repeater</div>
          <div className='legend_icon super-center'>
            <img className='mb_3 text-dark' src={repeater} />
          </div>
        </div>

        <div className='legend'>
          <div className='legend_text'>DCU</div>
          <div className='legend_icon super-center'>
            <img className='mb_3 text-dark' src={dcu} />
          </div>
        </div>

        <div className='legend'>
          <div className='legend_text'>
            <FormGroup inline>
              <Input type='checkbox' id='basic-cb-checked' className='cursor-pointer' checked={showPoleLabel} onClick={onShowPoleLabelClicked} />
              <Label for='basic-cb-checked' className='font-weight-bold cursor-pointer' onClick={onShowPoleLabelClicked}>
                Show pole label
              </Label>
            </FormGroup>
          </div>
          <div className='legend_icon super-center'>
            <img className='mb_3 text-dark' src={pole} />
          </div>
        </div>

        <div className='legend'>
          <div className='legend_text'>Installed Meter</div>
          <div className='legend_icon super-center'>
            <img className='mb_3 text-dark' src={meter} />
          </div>
        </div>

        <div className='legend'>
          <div className='legend_text'>Not Installed Meter</div>
          <div className='legend_icon super-center'>
            <img className='mb_3 text-dark' src={meter_not_installed} />
          </div>
        </div>
      </div>

      {/*Modules right side Legends*/}
      <div className='right_side_legend_dv super-center'>
        <div className='legend' onClick={handleFilterModal}>
          <div className='legend_text'>Apply Filter</div>
          <div className='legend_icon super-center'>
            <img className='mb_3 text-dark' src={filter} />
          </div>
        </div>
        {sliderButtonVisibility && (
          <div className='legend' onClick={handleModal}>
            <div className='legend_text'>MDMS</div>
            <div className='legend_icon super-center'>
              <img className='mb_3 text-dark' src={mdas} />
            </div>
          </div>
        )}
        {/* <div className='legend'>
          <div className='legend_text'>MDAS</div>
          <div className='legend_icon super-center'>
            <img className='mb_3 text-dark' src={mdms} />
          </div>
        </div> */}
      </div>
    </>
  )
}
export default GisUtility
