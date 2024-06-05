import GoogleApiWrapper from '@src/views/ui-elements/maps/individualProjectMap'
import Map from '@src/views/ui-elements/maps/Map'
import { Row, Col } from 'reactstrap'
import { useEffect, useState } from 'react'
import { useSelector, useDispatch, batch } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'

import { handleGoogleMapsData } from '@store/actions/UtilityProject/Summary'
import { handleMDMSHierarchyProgress } from '@store/actions/UtilityProject/MDMS/HierarchyProgress'
import {
  handleGISMapData,
  handleGISMapMarkerData,
  handleGISMapInitCenterData,
  handleGISMapPolyLineData,
  handleGISMapZoom,
  handleGISMapUpdatedCenter,
  handleGISDTRSelected,
  handleGISFilterSelected
} from '@store/actions/UtilityProject/GIS/MapAsset'

import {
  handleEnergyConsumptionData,
  handleAlertsData,
  handleOpertationalStatisticsData,
  handleUptimeData,
  handleBillsGeneratedData,
  handleSLAInformationData
} from '@store/actions/UtilityProject/MDMS/user'

import {
  handleEnergyConsumptionData as handleEnergyConsumptionDatadtr,
  handleAlertsData as handleAlertsDatadtr,
  handleOpertationalStatisticsData as handleOpertationalStatisticsDatadtr,
  handleUptimeData as handleUptimeDatadtr,
  handleBillsGeneratedData as handleBillsGeneratedDatadtr
} from '@store/actions/UtilityProject/MDMS/dtr'

import {
  handleEnergyConsumptionData as handleEnergyConsumptionDatafeeder,
  handleAlertsData as handleAlertsDatafeeder,
  handleOpertationalStatisticsData as handleOpertationalStatisticsDatafeeder,
  handleUptimeData as handleUptimeDatafeeder,
  handleBillsGeneratedData as handleBillsGeneratedDatafeeder
} from '@store/actions/UtilityProject/MDMS/feeder'

import {
  handleEnergyConsumptionData as handleEnergyConsumptionDatapss,
  handleAlertsData as handleAlertsDatapss,
  handleOpertationalStatisticsData as handleOpertationalStatisticsDatapss,
  handleUptimeData as handleUptimeDatapss,
  handleBillsGeneratedData as handleBillsGeneratedDatapss
} from '@store/actions/UtilityProject/MDMS/pss'

import {
  handleConsumerProfileInformationData,
  handleConsumerTotalConsumptionData,
  handleConsumerTotalRechargesData,
  handleConsumerTopAlertsData,
  handleCommandInfoData
} from '@store/actions/UtilityProject/MDMS/userprofile'

import useJwt from '@src/auth/jwt/useJwt'
import Loader from '@src/views/project/misc/loader'

// Icons
import meter from '@src/assets/images/gp_icons/ic_meter_installed.png'
import dtr from '@src/assets/images/gp_icons/ic_dtr.png'
import pole from '@src/assets/images/gp_icons/ic_pole.png'
import dcu from '@src/assets/images/gp_icons/ic_dcu.png'
import repeater from '@src/assets/images/gp_icons/ic_repeater.png'

import dtr_filter_yes from '@src/assets/images/gp_icons/ic_dtr_filter_yes_with_label.png'
import dtr_filter_no from '@src/assets/images/gp_icons/ic_dtr_filter_no_with_label.png'

import meter_filter_yes from '@src/assets/images/gp_icons/ic_meter_filter_yes.png'
import meter_filter_no from '@src/assets/images/gp_icons/ic_meter_filter_no.png'
import meter_installed_no from '@src/assets/images/gp_icons/ic_meter_installed_no.png'
import meter_searched from '@src/assets/images/gp_icons/ic_meter_searched.png'

// import { useHistory } from 'react-router-dom'
import authLogout from '../../../../../../auth/jwt/logoutlogic'

//import data from './sbpdcl_gis.json'
import { handleCurrentSelectedModuleStatus } from '@store/actions/Misc/currentSelectedModuleStatus'

const GoogleMapsWrapper = props => {
  const dispatch = useDispatch()
  const history = useHistory()
  const location = useLocation()

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const response = useSelector(state => state.UtilityGISMapsReducer)
  const markers = useSelector(state => state.UtilityGISMapsMarkerReducer)
  const polyline = useSelector(state => state.UtilityGISMapsPolyLineReducer)
  const initMapCenter = useSelector(state => state.UtilityGISMapsCenterReducer)
  const mapZoom = useSelector(state => state.UtilityGISMapsZoomReducer)
  const response_selected_dtr_filter = useSelector(state => state.UtilityGISDTRFilterReducer)

  // Already Selected Filter
  const AlreadySelectedFilter = useSelector(state => state.UtilityGISFilterSelectedReducer)

  let responseData = null
  if (response && response.responseData) {
    responseData = response.responseData
  } else {
    responseData = []
  }

  // Check If project is Changed
  const [selected_project, set_selected_project] = useState(undefined)
  const currentSelectedModuleStatus = useSelector(state => state.CurrentSelectedModuleStatusReducer.responseData)
  // console.log('Current Selected Module Status ....')
  // console.log(currentSelectedModuleStatus)

  if (currentSelectedModuleStatus.prev_project) {
    if (
      selected_project !== currentSelectedModuleStatus.project &&
      currentSelectedModuleStatus.prev_project !== currentSelectedModuleStatus.project
    ) {
      set_selected_project(currentSelectedModuleStatus.project)

      //Batching All Dispatches
      batch(() => {
        //1.Dispatch GIS Map Response Data
        dispatch(handleGISMapData([], true))

        //2.Dispatch Markers Data
        dispatch(handleGISMapMarkerData([], true))

        //3.Dispatch Map Center Data
        dispatch(handleGISMapInitCenterData({}, true))

        //4.Dispatch PolyLine Data
        dispatch(handleGISMapPolyLineData([], true))

        // 5.Clear GIS Filter Parameters
        dispatch(handleGISFilterSelected([]))

        // 6.Clear GIS DTR Selected List
        dispatch(handleGISDTRSelected([]))
      })
    }
  }
  const fetchData = async params => {
    if (AlreadySelectedFilter && AlreadySelectedFilter.responseData.length > 0) {
      return await useJwt
        .getGISFilteredApplyAssetsTillDTR(params)
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
    } else {
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
  }

  const fetchMeterLevelData = async params => {
    if (AlreadySelectedFilter.responseData.length > 0) {
      return await useJwt
        .getGISFilteredApplyAssetsTillMeter(params)
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
    } else {
      return await useJwt
        .getGISAssetsMeterLevel(params)
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
  }

  // const fetchFilteredData = async params => { }

  // React Hook when GIS Response Data is empty
  useEffect(async () => {
    if (!response || response.callAPI) {
      const params = {}
      if (AlreadySelectedFilter && AlreadySelectedFilter.responseData.length > 0) {
        params['project'] = props.project
        params['selectedFilterList'] = AlreadySelectedFilter.responseData[0]
      } else {
        params['project'] = props.project
      }
      params['vertical'] = location.pathname.split('/')[1]

      const [statusCode, response] = await fetchData(params)

      if (statusCode) {
        if (statusCode === 200) {
          const data = response.data.data.result.stat

          //1.Get All DTR Data
          const markers = data['live_dt_list']

          const feeder_list = data['feeder_list']
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

          if (response_selected_dtr_filter && response_selected_dtr_filter.responseData.length > 0) {
            const selectedDTR = response_selected_dtr_filter.responseData
            const filtered_dt_list = []

            for (const _ele of selectedDTR) {
              for (const _dt of markers) {
                if (_ele['value'] === _dt['site_id']) {
                  filtered_dt_list.push(_dt)
                }
              }
            }

            //2.Get Map Center
            const initMapCenter = { Lat: filtered_dt_list[0]['latitude'], Long: filtered_dt_list[0]['longitude'] }

            //Batching All Dispatches
            batch(() => {
              //1.Dispatch GIS Map Response Data
              dispatch(handleGISMapData(data))

              //2.Dispatch Markers Data
              dispatch(handleGISMapMarkerData(filtered_dt_list))

              //3.Dispatch Map Center Data
              dispatch(handleGISMapInitCenterData(initMapCenter))

              //4.Dispatch PolyLine Data
              dispatch(handleGISMapPolyLineData([]))
            })
          } else {
            //2.Get Map Center
            const initMapCenter = { Lat: markers[0]['latitude'], Long: markers[0]['longitude'] }

            //Batching All Dispatches
            batch(() => {
              //1.Dispatch GIS Map Response Data
              dispatch(handleGISMapData(data))

              //2.Dispatch Markers Data
              dispatch(handleGISMapMarkerData(markers))

              //3.Dispatch Map Center Data
              dispatch(handleGISMapInitCenterData(initMapCenter))

              //4.Dispatch PolyLine Data
              dispatch(handleGISMapPolyLineData([]))
            })
          }
        } else if (statusCode === 401 || statusCode === 403) {
          setLogout(true)
        }
      }
    }
  }, [response])

  //React Hook when Filter is applied

  const handleMapsMarkerClicked = async (markerProps, marker, e) => {
    //1.Get List of Previous Markers Dataset
    const previous_markers = markers['responseData']
    const previous_polylines = polyline['responseData']

    //2.Check Asset Type
    if (markerProps.data.asset_type === 'substation') {
      //Check if substation is already expanded
      const asset_with_substation_id = previous_markers.filter(function (item) {
        return item.parent_substation_id === markerProps.data.pss_id
      })

      //If Count of asset is greater than 0 remove all markers with parent_substation_id
      if (asset_with_substation_id.length > 0) {
        //Filter marker where substation id doesn't match
        const updated_marker_list = previous_markers.filter(function (item) {
          return item.parent_substation_id !== markerProps.data.pss_id
        })

        //Filter polylines where substation id doesn't match
        const updated_polyline_list = previous_polylines.filter(function (item) {
          return item.parent_substation_id !== markerProps.data.pss_id
        })

        const initMapCenter = { Lat: markerProps.data['latitude'], Long: markerProps.data['longitude'] }

        // dispatch(handleGISMapMarkerData(updated_markers))
        batch(() => {
          dispatch(handleGISMapMarkerData(updated_marker_list))
          dispatch(handleGISMapInitCenterData(initMapCenter))
          dispatch(handleGISMapPolyLineData(updated_polyline_list))
          dispatch(handleGISMapZoom(18))
        })
      } else {
        //Get All Feeders List
        const all_feeder = response['responseData']['feeder_list']

        //Filter feeder having same pss_id
        const filtered_feeder_list = all_feeder.filter(function (el) {
          return el.pss_id === markerProps.data.pss_id
        })

        const polyline_new = []
        for (const _ele of filtered_feeder_list) {
          //Add Asset Name and Asset Type to dict element
          _ele['asset_type'] = 'feeder'
          _ele['asset_name'] = _ele['feeder_name']
          _ele['asset_id'] = _ele['feeder_id']
          _ele['parent_substation_id'] = markerProps.data.pss_id
          _ele['parent_feeder_id'] = ''
          _ele['parent_dtr_id'] = ''

          //Get Latitude and Longitude of the asset
          const polyLine_temp = {
            path: [
              //Substation Lat and Lng
              {
                lat: markerProps.data.latitude,
                lng: markerProps.data.longitude
              },
              //Feeder Lat and Lng
              {
                lat: _ele['latitude'],
                lng: _ele['longitude']
              }
            ],
            asset_from: 'substation',
            asset_to: 'feeder',
            parent_substation_id: markerProps.data.pss_id,
            parent_feeder_id: '',
            parent_dtr_id: ''
          }

          polyline_new.push(polyLine_temp)
        }

        //Build Update Array of markers list
        const updated_markers = [...markers.responseData, ...filtered_feeder_list]

        //Remove Reduntant feeder markers
        // const filtered_updated_markers = updated_markers.reduce((acc, current) => {
        //   const x = acc.find(item => item.asset_name === current.asset_name)
        //   if (!x) {
        //     return acc.concat([current])
        //   } else {
        //     return acc
        //   }
        // }, [])

        //Initialize map center to asset clicked
        const initMapCenter = { Lat: markerProps.data['latitude'], Long: markerProps.data['longitude'] }

        // dispatch(handleGISMapMarkerData(updated_markers))
        batch(() => {
          dispatch(handleGISMapMarkerData(updated_markers))
          dispatch(handleGISMapInitCenterData(initMapCenter))
          dispatch(handleGISMapPolyLineData([...polyline['responseData'], ...polyline_new]))
          dispatch(handleGISMapZoom(18))
        })
      }
    } else if (markerProps.data.asset_type === 'feeder') {
      //Check if feeder is already expanded
      const asset_with_feeder_id = previous_markers.filter(function (item) {
        return item.parent_feeder_id === markerProps.data.feeder_id
      })

      //If Count of asset is greater than 0 remove all markers with parent_substation_id
      if (asset_with_feeder_id.length > 0) {
        //Filter marker where substation id doesn't match
        const updated_marker_list = previous_markers.filter(function (item) {
          return item.parent_feeder_id !== markerProps.data.feeder_id
        })

        //Filter polylines where substation id doesn't match
        const updated_polyline_list = previous_polylines.filter(function (item) {
          return item.parent_feeder_id !== markerProps.data.feeder_id
        })

        const initMapCenter = { Lat: markerProps.data['latitude'], Long: markerProps.data['longitude'] }

        // dispatch(handleGISMapMarkerData(updated_markers))
        batch(() => {
          dispatch(handleGISMapMarkerData(updated_marker_list))
          dispatch(handleGISMapInitCenterData(initMapCenter))
          dispatch(handleGISMapPolyLineData(updated_polyline_list))
          dispatch(handleGISMapZoom(18))
        })
      } else {
        // Get All DTR list
        const all_dtr = response['responseData']['live_dt_list']

        // Get Filtered List of DTR within the Feeder
        const filtered_dtr_list = all_dtr.filter(function (el) {
          return el.feeder_id === markerProps.data.feeder_id
        })

        const polyline_new = []
        for (const _ele of filtered_dtr_list) {
          _ele['asset_type'] = 'dtr'
          _ele['asset_name'] = _ele['site_name']
          _ele['asset_id'] = _ele['site_id']
          _ele['parent_id'] = _ele['feeder_id']
          _ele['parent_substation_id'] = markerProps.data.parent_substation_id
          _ele['parent_feeder_id'] = markerProps.data.feeder_id
          _ele['parent_dtr_id'] = ''

          // Get Lat and Lng of Assets
          const polyLine_temp = {
            path: [
              //Substation Lat and Lng
              {
                lat: markerProps.data.latitude,
                lng: markerProps.data.longitude
              },
              //Feeder Lat and Lng
              {
                lat: _ele['latitude'],
                lng: _ele['longitude']
              }
            ],
            asset_from: 'feeder',
            asset_to: 'dtr',
            parent_substation_id: markerProps.data.pss_id,
            parent_feeder_id: markerProps.data.feeder_id,
            parent_dtr_id: ''
          }

          polyline_new.push(polyLine_temp)
        }

        // Updated Marker List
        const updated_markers = [...markers.responseData, ...filtered_dtr_list]

        //Updated Map Center coordinates
        const initMapCenter = { Lat: markerProps.data['latitude'], Long: markerProps.data['longitude'] }

        // dispatch(handleGISMapMarkerData(updated_markers))
        batch(() => {
          dispatch(handleGISMapMarkerData(updated_markers))
          dispatch(handleGISMapInitCenterData(initMapCenter))
          dispatch(handleGISMapPolyLineData([...polyline['responseData'], ...polyline_new]))
          dispatch(handleGISMapZoom(19))
        })
      }
    } else if (markerProps.data.asset_type === 'DTR') {
      let project = ''
      if (location.pathname.split('/')[2] === 'sbpdcl') {
        project = 'ipcl'
      } else {
        project = location.pathname.split('/')[2]
      }

      batch(() => {
        dispatch(
          handleMDMSHierarchyProgress({
            project_type: location.pathname.split('/')[1],
            project_name: project,
            module_name: 'mdms',
            pss_name: markerProps.data.parent_substation_id,
            feeder_name: markerProps.data.parent_feeder_id,
            dtr_name: markerProps.data.site_id,
            user_name: '',
            mdms_state: 'user'
          })
        )

        //Clear All User Data from redux store For DTR  level
        dispatch(handleEnergyConsumptionData([], true))
        dispatch(handleAlertsData([], true))
        dispatch(handleUptimeData([], true))
        dispatch(handleBillsGeneratedData([], true))
        dispatch(handleOpertationalStatisticsData([], true))
        dispatch(handleSLAInformationData([], true))

        //Clear All User profile Data from redux store
        dispatch(handleConsumerProfileInformationData([], true))
        dispatch(handleConsumerTotalConsumptionData([], true))
        dispatch(handleConsumerTotalRechargesData([], true))
        dispatch(handleConsumerTopAlertsData([], true))
        dispatch(handleCommandInfoData([], true))

        //Clear All Feeder Level Data
        dispatch(handleEnergyConsumptionDatadtr([], true))
        dispatch(handleAlertsDatadtr([], true))
        dispatch(handleUptimeDatadtr([], true))
        dispatch(handleBillsGeneratedDatadtr([], true))
        dispatch(handleOpertationalStatisticsDatadtr([], true))

        // Clear All PSS Level Data
        dispatch(handleEnergyConsumptionDatafeeder([], true))
        dispatch(handleAlertsDatafeeder([], true))
        dispatch(handleUptimeDatafeeder([], true))
        dispatch(handleBillsGeneratedDatafeeder([], true))
        dispatch(handleOpertationalStatisticsDatafeeder([], true))

        // Clear All Project Level Data
        dispatch(handleEnergyConsumptionDatapss([], true))
        dispatch(handleAlertsDatapss([], true))
        dispatch(handleUptimeDatapss([], true))
        dispatch(handleBillsGeneratedDatapss([], true))
        dispatch(handleOpertationalStatisticsDatapss([], true))
      })

      //Make Sidebar Button Visible
      props.updateSiderButtonVisibility(true)

      //Check if dtr is already expanded
      const asset_with_dtr_id = previous_markers.filter(function (item) {
        return item.parent_dtr_id === markerProps.data.site_id
      })

      //If Count of asset is greater than 0 remove all markers with parent_substation_id
      if (asset_with_dtr_id.length > 0) {
        //Filter marker where substation id doesn't match
        const updated_marker_list = previous_markers.filter(function (item) {
          return item.parent_dtr_id !== markerProps.data.site_id
        })

        //Filter polylines where substation id doesn't match
        const updated_polyline_list = previous_polylines.filter(function (item) {
          return item.parent_dtr_id !== markerProps.data.site_id
        })

        const initMapCenter = { Lat: markerProps.data['latitude'], Long: markerProps.data['longitude'] }

        // dispatch(handleGISMapMarkerData(updated_markers))
        batch(() => {
          dispatch(handleGISMapMarkerData(updated_marker_list))
          dispatch(handleGISMapInitCenterData(initMapCenter))

          // ResetMapCenter
          dispatch(handleGISMapUpdatedCenter({ lat: markerProps.data['latitude'], lng: markerProps.data['longitude'] }))

          dispatch(handleGISMapPolyLineData(updated_polyline_list))
          dispatch(handleGISMapZoom(18))
        })
      } else {
        const params = {
          project: props.project,
          site_id: markerProps.data.site_id
        }
        if (AlreadySelectedFilter.responseData.length > 0) {
          params['project'] = props.project
          params['selectedFilterList'] = AlreadySelectedFilter.responseData[0]
        }

        const [statusCode, response] = await fetchMeterLevelData(params)

        //1.Get All Meters List
        const all_meters = response.data.data.result.stat.household_list

        //2.Get All poles List
        const all_poles = response.data.data.result.stat.pole_list

        //3.Get All DCU List
        const all_dcu = response.data.data.result.stat.dcu_list

        //4.Get All Repeater List
        const all_repeater = response.data.data.result.stat.repeater_list

        const polyline_new = []

        //Add Additional Keys to Poles Data
        if (all_poles.length > 0) {
          //Add Additional Keys to pole Data JSON Object
          for (const _ele of all_poles) {
            _ele['asset_type'] = 'Pole'
            _ele['asset_name'] = _ele['pole_number']
            _ele['asset_id'] = _ele['pole_id']
            _ele['parent_id'] = ''
            _ele['parent_substation_id'] = markerProps.data.parent_substation_id
            _ele['parent_feeder_id'] = markerProps.data.parent_feeder_id
            _ele['parent_dtr_id'] = markerProps.data.site_id
          }
        }

        //Add Additional Keys to dcu data
        if (all_dcu.length > 0) {
          //Add Additional Keys to DCU Data JSON Object
          for (const _ele of all_dcu) {
            _ele['asset_type'] = 'DCU'
            _ele['asset_name'] = _ele['dcuID']
            _ele['asset_id'] = _ele['dcuID']
            _ele['parent_id'] = ''
            _ele['parent_substation_id'] = markerProps.data.parent_substation_id
            _ele['parent_feeder_id'] = markerProps.data.parent_feeder_id
            _ele['parent_dtr_id'] = markerProps.data.site_id
          }
        }

        //Add Additional Keys to Repeater Data
        if (all_repeater.length > 0) {
          //Add Additional Keys to Repeater Data JSON Object
          for (const _ele of all_repeater) {
            _ele['asset_type'] = 'Repeater'
            _ele['asset_name'] = _ele['repeaterId']
            _ele['asset_id'] = _ele['repeaterId']
            _ele['parent_id'] = ''
            _ele['parent_substation_id'] = markerProps.data.parent_substation_id
            _ele['parent_feeder_id'] = markerProps.data.parent_feeder_id
            _ele['parent_dtr_id'] = markerProps.data.site_id
          }
        }

        //Add Additional keys to all meter data and add polyline between meter and pole
        if (all_meters.length > 0) {
          for (const _ele of all_meters) {
            _ele['asset_type'] = 'Meter'
            _ele['asset_name'] = _ele['asset_sequence']
            _ele['asset_id'] = _ele['asset_sequence']
            _ele['parent_id'] = _ele['site_id']
            _ele['parent_substation_id'] = markerProps.data.parent_substation_id
            _ele['parent_feeder_id'] = markerProps.data.parent_feeder_id
            _ele['parent_dtr_id'] = markerProps.data.site_id
            _ele['asset_searched'] = 'No'

            //Get Lat Lng of Pole meter is connected to
            const pole_data = all_poles.filter(function (el) {
              return el.pole_id === _ele.pole_id
            })

            // Get Lat and Lng of Assets

            if (pole_data.length > 0) {
              const polyLine_temp = {
                path: [
                  //Pole Lat and Lng
                  {
                    lat: pole_data[0].latitude,
                    lng: pole_data[0].longitude
                  },
                  //Meter Lat and Lng
                  {
                    lat: _ele['latitude'],
                    lng: _ele['longitude']
                  }
                ],
                asset_from: 'pole',
                asset_to: 'meter',
                parent_substation_id: markerProps.data.pss_id,
                parent_feeder_id: markerProps.data.feeder_id,
                parent_dtr_id: markerProps.data.site_id
              }
              polyline_new.push(polyLine_temp)
            }
          }
        }

        // Add Polylines between poles and DTR
        if (all_poles.length > 0) {
          //Get All poles where prev_pole_id === -1 and connect it directly to DTR
          const filtered_pole_list = all_poles.filter(function (el) {
            return el.prev_pole_id === '-1'
          })

          for (const _ele of filtered_pole_list) {
            const polyLine_temp = {
              path: [
                //DTR Lat and Lng
                {
                  lat: markerProps.data.latitude,
                  lng: markerProps.data.longitude
                },
                //Pole Lat and Lng
                {
                  lat: _ele['latitude'],
                  lng: _ele['longitude']
                }
              ],
              asset_from: 'dtr',
              asset_to: 'pole',
              parent_substation_id: markerProps.data.pss_id,
              parent_feeder_id: markerProps.data.feeder_id,
              parent_dtr_id: markerProps.data.site_id
            }
            polyline_new.push(polyLine_temp)
          }
        }

        //Add Polylines between poles and poles
        if (all_poles.length > 0) {
          //Get All Poles where prev_pole_id !== -1 and establish connection between poles
          const filtered_pole_list_not_connected_dtr = all_poles.filter(function (el) {
            return el.prev_pole_id !== '-1'
          })

          for (const _ele of filtered_pole_list_not_connected_dtr) {
            //Get Lat Lng of Pole, current pole is connected to
            const pole_data = all_poles.filter(function (el) {
              return el.pole_id === _ele.prev_pole_id
            })

            if (pole_data.length > 0) {
              const polyLine_temp = {
                path: [
                  //Connected Pole Lat and Lng
                  {
                    lat: pole_data[0].latitude,
                    lng: pole_data[0].longitude
                  },
                  //Current Pole Lat and Lng
                  {
                    lat: _ele['latitude'],
                    lng: _ele['longitude']
                  }
                ],
                asset_from: 'pole',
                asset_to: 'pole',
                parent_substation_id: markerProps.data.pss_id,
                parent_feeder_id: markerProps.data.feeder_id,
                parent_dtr_id: markerProps.data.site_id
              }
              polyline_new.push(polyLine_temp)
            }
          }
        }

        //Add Polylines between dcu and dtr
        if (all_dcu.length > 0) {
          for (const _ele of all_dcu) {
            const polyline_temp = {
              path: [
                //DTR Lat and Lng
                {
                  lat: markerProps.data.latitude,
                  lng: markerProps.data.longitude
                },
                //DCU Lat and Long
                {
                  lat: _ele['latitude'],
                  lng: _ele['longitude']
                }
              ],
              asset_from: 'dtr',
              asset_to: 'dcu',
              parent_substation_id: markerProps.data.pss_id,
              parent_feeder_id: markerProps.data.feeder_id,
              parent_dtr_id: markerProps.data.site_id
            }
            polyline_new.push(polyline_temp)
          }
        }

        // Add Polylines between Repeater and Pole
        if (all_repeater.length > 0) {
          for (const _ele of all_repeater) {
            //Get pole id repeater is connected to
            const repeater_pole_id = _ele['pole_id']

            //Get Lat Long of pole repeater is connected to
            const pole_data = all_poles.filter(function (el) {
              return el.pole_id === repeater_pole_id
            })

            if (pole_data.length > 0) {
              const polyLine_temp = {
                path: [
                  //Connected Pole Lat and Lng
                  {
                    lat: pole_data[0].latitude,
                    lng: pole_data[0].longitude
                  },
                  //Current repeater Lat and Lng
                  {
                    lat: _ele['latitude'],
                    lng: _ele['longitude']
                  }
                ],
                asset_from: 'pole',
                asset_to: 'repeater',
                parent_substation_id: markerProps.data.pss_id,
                parent_feeder_id: markerProps.data.feeder_id,
                parent_dtr_id: markerProps.data.site_id
              }
              polyline_new.push(polyLine_temp)
            }
          }
        }

        //3. Updated Marker List
        const updated_markers = [...markers.responseData, ...all_meters, ...all_poles, ...all_dcu, ...all_repeater]

        //Updated Map Center coordinates
        const initMapCenter = { Lat: markerProps.data['latitude'], Long: markerProps.data['longitude'] }

        // dispatch(handleGISMapMarkerData(updated_markers))
        batch(() => {
          dispatch(handleGISMapMarkerData(updated_markers))
          dispatch(handleGISMapInitCenterData(initMapCenter))

          // Reset Map Center
          dispatch(handleGISMapUpdatedCenter({ lat: markerProps.data['latitude'], lng: markerProps.data['longitude'] }))

          dispatch(handleGISMapPolyLineData([...polyline['responseData'], ...polyline_new]))
          if (mapZoom === 20) {
            dispatch(handleGISMapZoom(19))
          } else if (mapZoom === 19) {
            dispatch(handleGISMapZoom(20))
          } else {
            dispatch(handleGISMapZoom(20))
          }
        })

        props.handleModal()
      }
    } else if (markerProps.data.asset_type === 'Pole') {
      //Do Nothing
    } else if (markerProps.data.asset_type === 'Meter') {
      props.updateSiderButtonVisibility(true)
      props.handleModal()

      let project = ''
      if (location.pathname.split('/')[2] === 'sbpdcl') {
        project = 'ipcl'
      } else {
        project = location.pathname.split('/')[2]
      }

      batch(() => {
        dispatch(
          handleMDMSHierarchyProgress({
            project_type: location.pathname.split('/')[1],
            project_name: project,
            module_name: 'mdms',
            pss_name: markerProps.data.parent_substation_id,
            feeder_name: markerProps.data.parent_feeder_id,
            dtr_name: markerProps.data.parent_dtr_id,
            user_name: markerProps.data.asset_name,
            mdms_state: 'userConsumption',
            user_type: markerProps.data.connection_type
          })
        )

        //Clear All User Data from redux store For DTR  level
        dispatch(handleEnergyConsumptionData([], true))
        dispatch(handleAlertsData([], true))
        dispatch(handleUptimeData([], true))
        dispatch(handleBillsGeneratedData([], true))
        dispatch(handleOpertationalStatisticsData([], true))

        //Clear All User profile Data from redux store
        dispatch(handleConsumerProfileInformationData([], true))
        dispatch(handleConsumerTotalConsumptionData([], true))
        dispatch(handleConsumerTotalRechargesData([], true))
        dispatch(handleConsumerTopAlertsData([], true))
        dispatch(handleCommandInfoData([], true))

        //Clear All Feeder Level Data
        dispatch(handleEnergyConsumptionDatadtr([], true))
        dispatch(handleAlertsDatadtr([], true))
        dispatch(handleUptimeDatadtr([], true))
        dispatch(handleBillsGeneratedDatadtr([], true))
        dispatch(handleOpertationalStatisticsDatadtr([], true))

        // Clear All PSS Level Data
        dispatch(handleEnergyConsumptionDatafeeder([], true))
        dispatch(handleAlertsDatafeeder([], true))
        dispatch(handleUptimeDatafeeder([], true))
        dispatch(handleBillsGeneratedDatafeeder([], true))
        dispatch(handleOpertationalStatisticsDatafeeder([], true))

        // Clear All Project Level Data
        dispatch(handleEnergyConsumptionDatapss([], true))
        dispatch(handleAlertsDatapss([], true))
        dispatch(handleUptimeDatapss([], true))
        dispatch(handleBillsGeneratedDatapss([], true))
        dispatch(handleOpertationalStatisticsDatapss([], true))
      })
    }
  }

  return (
    response &&
    !response.callAPI && (
      <Map
        project={props.project}
        meter={meter}
        pole={pole}
        dtr={dtr}
        dcu={dcu}
        repeater={repeater}
        dtr_filter_no={dtr_filter_no}
        dtr_filter_yes={dtr_filter_yes}
        meter_filter_no={meter_filter_no}
        meter_filter_yes={meter_filter_yes}
        meter_installed_no={meter_installed_no}
        meter_searched={meter_searched}
        showPoleLabel={props.showPoleLabel}
        handleMapsMarkerClicked={handleMapsMarkerClicked}
      />
    )
  )
}

export default GoogleMapsWrapper
