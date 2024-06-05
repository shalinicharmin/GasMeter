import { Button, Col, Row } from 'reactstrap'
import Select from 'react-select'
import { selectThemeColors } from '@utils'
import makeAnimated from 'react-select/animated'
import { useSelector, useDispatch, batch } from 'react-redux'
import { useEffect, useState } from 'react'
import {
  handleGISMapData,
  handleGISMapMarkerData,
  handleGISMapInitCenterData,
  handleGISMapPolyLineData,
  handleGISMapZoom,
  handleGISDTRSelected,
  handleGISFilterSelected
} from '@store/actions/UtilityProject/GIS/MapAsset'
import { useLocation, useHistory } from 'react-router-dom'

import { handleCurrentSelectedModuleStatus } from '@store/actions/Misc/currentSelectedModuleStatus'

const FilterForm = props => {
  const dispatch = useDispatch()
  const location = useLocation()

  // Check If project is Changed
  const [selected_project, set_selected_project] = useState(undefined)
  const currentSelectedModuleStatus = useSelector(state => state.CurrentSelectedModuleStatusReducer.responseData)

  if (currentSelectedModuleStatus.prev_project) {
    if (
      selected_project !== currentSelectedModuleStatus.project &&
      currentSelectedModuleStatus.prev_project !== currentSelectedModuleStatus.project
    ) {
      set_selected_project(currentSelectedModuleStatus.project)

      //Batching All Dispatches
      batch(() => {
        //Clear Redux Data
        dispatch(handleGISFilterSelected([]))
        dispatch(handleGISMapData([], true))
        dispatch(handleGISDTRSelected([]))
      })
    }
  }
  const animatedComponents = makeAnimated()

  // REdux Store Listener
  const response = useSelector(state => state.UtilityGISFilterReducer)
  const AlreadySelectedFilter = useSelector(state => state.UtilityGISFilterSelectedReducer)
  const response_gis_map_reducer = useSelector(state => state.UtilityGISMapsReducer)
  const response_selected_dtr_filter = useSelector(state => state.UtilityGISDTRFilterReducer)

  const [selectedDTR, setSelectedDTR] = useState([])
  useEffect(() => {
    setSelectedDTR(response_selected_dtr_filter.responseData)
  }, [response_selected_dtr_filter])

  // setSelectedDTR(response_selected_dtr_filter.responseData)

  //Filter List and Selected Filter Parameter List
  const [FilterList, setFilterList] = useState([])
  const [SelectedFilterParameterList, setSelectedFilterParameterList] = useState([])

  //Selected Filter and Parameter
  const [SelectedFilter, setSelectedFilter] = useState(undefined)
  const [SelectedFilterParameter, setSelectedFilterParameter] = useState(undefined)

  //State to manage fetch filtered Data
  const [FetchFilteredData, setFetchFilteredData] = useState(false)

  // Set of All DTR present populate
  const [dtr, setDtr] = useState([])
  useEffect(() => {
    if (response_gis_map_reducer && !response_gis_map_reducer.callAPI) {
      // Populate Substation List for DropDown

      const DTR_Dropdown_list = []
      for (const _ele of response_gis_map_reducer.responseData['live_dt_list']) {
        const temp_dtr = {}
        temp_dtr['value'] = _ele['site_id']
        temp_dtr['label'] = _ele['site_name']
        temp_dtr['isFixed'] = 'true'

        DTR_Dropdown_list.push(temp_dtr)
      }

      setDtr(DTR_Dropdown_list)
    }
  }, [response_gis_map_reducer])

  //Check of Any Filter is Already Selected
  if (response && response.responseData) {
    if (AlreadySelectedFilter && AlreadySelectedFilter.responseData.length > 0) {
      // const selected_filter_id = AlreadySelectedFilter.responseData[0]['id']
      //Get Selected
      if (!SelectedFilter) {
        const selected_filter = {}
        selected_filter['value'] = AlreadySelectedFilter.responseData[0]['id']
        selected_filter['label'] = AlreadySelectedFilter.responseData[0]['name']
        selected_filter['isFixed'] = 'true'
        setSelectedFilter(selected_filter)

        // const Filter_Parameters = []
        const _filter = response.responseData.filterList.filter(function (item) {
          return item['filterID'] === selected_filter['value']
        })
        const Filter_Parameters = []
        for (const _ele of _filter[0]['filterParameter']) {
          const temp = {}
          temp['value'] = _ele['id']
          temp['label'] = _ele['name']
          temp['isFixed'] = 'true'
          Filter_Parameters.push(temp)
        }
        setSelectedFilterParameterList(Filter_Parameters)

        const selected_filter_parameter = {}
        selected_filter_parameter['value'] = AlreadySelectedFilter.responseData[0].selectedFilterParameter['id']
        selected_filter_parameter['label'] = AlreadySelectedFilter.responseData[0].selectedFilterParameter['name']
        selected_filter_parameter['isFixed'] = 'true'
        setSelectedFilterParameter(selected_filter_parameter)
      }
    } else {
    }
  }

  //Set Filter List if response is available
  if (response && response.responseData) {
    if (response.responseData.filterList && FilterList.length <= 0) {
      const Filter_List = []
      for (const _ele of response.responseData.filterList) {
        const temp = {}
        temp['value'] = _ele['filterID']
        temp['label'] = _ele['filterName']
        temp['isFixed'] = 'true'
        Filter_List.push(temp)
      }
      setFilterList(Filter_List)
    }
  }

  const onFilterSelected = selectedOption => {
    if (selectedOption) {
      // const Filter_Parameters = []
      const _filter = response.responseData.filterList.filter(function (item) {
        return item['filterID'] === selectedOption['value']
      })

      const Filter_Parameters = []
      for (const _ele of _filter[0]['filterParameter']) {
        const temp = {}
        temp['value'] = _ele['id']
        temp['label'] = _ele['name']
        temp['isFixed'] = 'true'
        Filter_Parameters.push(temp)
      }
      setSelectedFilterParameterList(Filter_Parameters)

      setSelectedFilter(selectedOption)
    } else {
      setSelectedFilter(undefined)
    }
  }

  const onFilterParameterSelected = selectedOption => {
    if (selectedOption) {
      setSelectedFilterParameter(selectedOption)
    } else {
      setSelectedFilterParameter(undefined)
    }
  }

  const onApplyButtonClicked = () => {
    if (SelectedFilter && SelectedFilterParameter) {
      // Todo
      const _temp_selected_filter = []
      const _temp_filter = {
        name: SelectedFilter['label'],
        id: SelectedFilter['value'],
        selectedFilterParameter: {
          name: SelectedFilterParameter['label'],
          id: SelectedFilterParameter['value']
        }
      }
      _temp_selected_filter.push(_temp_filter)

      batch(() => {
        dispatch(handleGISFilterSelected(_temp_selected_filter))
        dispatch(handleGISMapData([], true))
        dispatch(handleGISDTRSelected(selectedDTR))
      })
      props.handleModal()
    }
  }

  const onResetButtonClicked = () => {
    batch(() => {
      dispatch(handleGISFilterSelected([]))
      // setSelectedFilter(undefined)
      // setSelectedFilterParameter(undefined)
      dispatch(handleGISMapData([], true))
      dispatch(handleGISDTRSelected([]))
    })
    props.handleModal()
  }

  const onDTRSelected = selectedOption => {
    //Update DTR State array on option selected
    setSelectedDTR(selectedOption)
  }

  return (
    <Row className='mb-1'>
      <Col sm='12' className='mb-2'>
        {}
        <Select
          isClearable={true}
          theme={selectThemeColors}
          closeMenuOnSelect={true}
          components={animatedComponents}
          onChange={onFilterSelected}
          isSearchable
          value={SelectedFilter ? SelectedFilter : undefined}
          options={FilterList}
          className='react-select border-secondary rounded'
          classNamePrefix='select'
          placeholder='Select Filter ...'
        />
      </Col>
      <Col sm='12' className='mb-2'>
        <Select
          isClearable={true}
          theme={selectThemeColors}
          closeMenuOnSelect={true}
          components={animatedComponents}
          isSearchable
          value={SelectedFilterParameter ? SelectedFilterParameter : undefined}
          onChange={onFilterParameterSelected}
          options={SelectedFilterParameterList}
          className='react-select border-secondary rounded'
          classNamePrefix='select'
          placeholder='Select Filter Parameter ...'
        />
      </Col>
      <Col sm='12' className='mb-2'>
        <Select
          isClearable={true}
          theme={selectThemeColors}
          closeMenuOnSelect={true}
          value={selectedDTR}
          components={animatedComponents}
          onChange={onDTRSelected}
          isSearchable
          isMulti
          options={dtr}
          className='react-select border-secondary rounded'
          classNamePrefix='select'
          placeholder='Select DTR ...'
        />
      </Col>
      <Col sm='12' className='mb-2'>
        <Button.Ripple className='btn-block' color='primary' onClick={onApplyButtonClicked}>
          Apply
        </Button.Ripple>
      </Col>
      <Col sm='12' className='mb-2'>
        <Button.Ripple className='btn-block' color='primary' onClick={onResetButtonClicked}>
          Reset
        </Button.Ripple>
      </Col>
    </Row>
  )
}

export default FilterForm
