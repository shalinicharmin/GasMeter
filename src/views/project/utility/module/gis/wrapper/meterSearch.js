import { Button, Col, Row, InputGroup, Input } from "reactstrap"
import { ChevronLeft, ChevronRight, Search } from "react-feather"
import { useEffect, useState } from "react"
import useJwt from "@src/auth/jwt/useJwt"
import { useSelector, useDispatch, batch } from "react-redux"
import { useLocation, useHistory } from "react-router-dom"
// import { useHistory } from 'react-router-dom'

import { handleMDMSHierarchyProgress } from "@store/actions/UtilityProject/MDMS/HierarchyProgress"
import {
  handleGISMapData,
  handleGISMapMarkerData,
  handleGISMapInitCenterData,
  handleGISMapUpdatedCenter,
  handleGISMapPolyLineData,
  handleGISMapZoom,
  handleGISFilterSelected
} from "@store/actions/UtilityProject/GIS/MapAsset"

import {
  handleEnergyConsumptionData,
  handleAlertsData,
  handleOpertationalStatisticsData,
  handleUptimeData,
  handleBillsGeneratedData
} from "@store/actions/UtilityProject/MDMS/user"

import {
  handleConsumerProfileInformationData,
  handleConsumerTotalConsumptionData,
  handleConsumerTotalRechargesData,
  handleConsumerTopAlertsData,
  handleCommandInfoData
} from "@store/actions/UtilityProject/MDMS/userprofile"

const MeterSearch = (props) => {
  const dispatch = useDispatch()
  const location = useLocation()
  const history = useHistory()

  const [meterDetail, setMeterDetail] = useState(null)
  const [searchedMeterResponse, setSearchedMeterResponse] = useState(null)

  const response = useSelector((state) => state.UtilityGISMapsReducer)
  const markers = useSelector((state) => state.UtilityGISMapsMarkerReducer)
  const polyline = useSelector((state) => state.UtilityGISMapsPolyLineReducer)
  const initMapCenter = useSelector((state) => state.UtilityGISMapsCenterReducer)
  const mapZoom = useSelector((state) => state.UtilityGISMapsZoomReducer)

  const fetchData = async (params) => {
    return await useJwt
      .getGISSearchData(params)
      .then((res) => {
        const status = res.status
        return [status, res]
      })
      .catch((err) => {
        if (err.response) {
          const status = err.response.status
          return [status, err]
        } else {
          return [0, err]
        }
      })
  }

  const fetchMeterLevelData = async (params) => {
    return await useJwt
      .getGISAssetsMeterLevel(params)
      .then((res) => {
        const status = res.status
        return [status, res]
      })
      .catch((err) => {
        if (err.response) {
          const status = err.response.status
          return [status, err]
        } else {
          return [0, err]
        }
      })
  }

  const handleChange = (event) => {
    setMeterDetail(event.target.value)
  }

  const onSearchButtonClicked = async () => {
    if (meterDetail !== null) {
      const params = {
        project: props.project,
        unique_id: meterDetail,
        asset_type: "meter"
      }

      //Get searched Meter Info
      const [statusCode, responseInfo] = await fetchData(params)

      if (statusCode) {
        if (statusCode === 401 || statusCode === 403) {
          setLogout(true)
        } else {
          const meter_details = responseInfo.data.data.result.stat.asset

          // console.log('Searched Meter Data ....')
          // console.log(meter_details)

          // if Meter Exist
          if (meter_details.length > 0) {
            const meter_dtr_info = response.responseData["dt_list"].filter(function (item) {
              return item.site_id === meter_details[0]["site_id"]
            })
            const params = {
              project: props.project,
              site_id: meter_details[0]["site_id"]
            }
            const [statusCode, responseMeter] = await fetchMeterLevelData(params)

            //1.Get All Meters List
            const all_meters = responseMeter.data.data.result.stat.household_list

            //2.Get All poles List
            const all_poles = responseMeter.data.data.result.stat.pole_list

            //3.Get All DCU List
            const all_dcu = responseMeter.data.data.result.stat.dcu_list

            //4.Get All Repeater List
            const all_repeater = responseMeter.data.data.result.stat.repeater_list

            const polyline_new = []

            //Add Additional Keys to Poles Data
            if (all_poles.length > 0) {
              //Add Additional Keys to pole Data JSON Object
              for (const _ele of all_poles) {
                _ele["asset_type"] = "Pole"
                _ele["asset_name"] = _ele["pole_number"]
                _ele["asset_id"] = _ele["pole_id"]
                _ele["parent_id"] = ""
                _ele["parent_substation_id"] = meter_dtr_info[0].parent_substation_id
                _ele["parent_feeder_id"] = meter_dtr_info[0].parent_feeder_id
                _ele["parent_dtr_id"] = meter_details[0]["site_id"]
              }
            }

            //Add Additional Keys to dcu data
            if (all_dcu.length > 0) {
              //Add Additional Keys to DCU Data JSON Object
              for (const _ele of all_dcu) {
                _ele["asset_type"] = "DCU"
                _ele["asset_name"] = _ele["dcuID"]
                _ele["asset_id"] = _ele["dcuID"]
                _ele["parent_id"] = ""
                _ele["parent_substation_id"] = meter_dtr_info[0].parent_substation_id
                _ele["parent_feeder_id"] = meter_dtr_info[0].parent_feeder_id
                _ele["parent_dtr_id"] = meter_details[0]["site_id"]
              }
            }

            //Add Additional Keys to Repeater Data
            if (all_repeater.length > 0) {
              //Add Additional Keys to Repeater Data JSON Object
              for (const _ele of all_repeater) {
                _ele["asset_type"] = "Repeater"
                _ele["asset_name"] = _ele["repeaterId"]
                _ele["asset_id"] = _ele["repeaterId"]
                _ele["parent_id"] = ""
                _ele["parent_substation_id"] = meter_dtr_info[0].parent_substation_id
                _ele["parent_feeder_id"] = meter_dtr_info[0].parent_feeder_id
                _ele["parent_dtr_id"] = meter_details[0]["site_id"]
              }
            }

            //Add Additional keys to all meter data and add polyline between meter and pole
            if (all_meters.length > 0) {
              for (const _ele of all_meters) {
                _ele["asset_type"] = "Meter"
                _ele["asset_name"] = _ele["asset_sequence"]
                _ele["asset_id"] = _ele["asset_sequence"]
                _ele["parent_id"] = _ele["site_id"]
                _ele["parent_substation_id"] = meter_dtr_info[0].parent_substation_id
                _ele["parent_feeder_id"] = meter_dtr_info[0].parent_feeder_id
                _ele["parent_dtr_id"] = meter_details[0]["site_id"]

                // Check if Meter is searched
                // And If Matched highlight with other color
                if (meter_details[0]["meter_address"] === _ele["meter_address"]) {
                  _ele["asset_searched"] = "Yes"
                } else {
                  _ele["asset_searched"] = "No"
                }

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
                        lat: _ele["latitude"],
                        lng: _ele["longitude"]
                      }
                    ],
                    asset_from: "pole",
                    asset_to: "meter",
                    parent_substation_id: meter_dtr_info[0].parent_substation_id,
                    parent_feeder_id: meter_dtr_info[0].parent_feeder_id,
                    parent_dtr_id: meter_details[0]["site_id"]
                  }
                  polyline_new.push(polyLine_temp)
                }
              }
            }

            // Add Polylines between poles and DTR
            if (all_poles.length > 0) {
              //Get All poles where prev_pole_id === -1 and connect it directly to DTR
              const filtered_pole_list = all_poles.filter(function (el) {
                return el.prev_pole_id === "-1"
              })

              for (const _ele of filtered_pole_list) {
                const polyLine_temp = {
                  path: [
                    //DTR Lat and Lng
                    {
                      lat: meter_dtr_info[0].latitude,
                      lng: meter_dtr_info[0].longitude
                    },
                    //Pole Lat and Lng
                    {
                      lat: _ele["latitude"],
                      lng: _ele["longitude"]
                    }
                  ],
                  asset_from: "dtr",
                  asset_to: "pole",
                  parent_substation_id: meter_dtr_info[0].parent_substation_id,
                  parent_feeder_id: meter_dtr_info[0].parent_feeder_id,
                  parent_dtr_id: meter_details[0]["site_id"]
                }
                polyline_new.push(polyLine_temp)
              }
            }

            //Add Polylines between poles and poles
            if (all_poles.length > 0) {
              //Get All Poles where prev_pole_id !== -1 and establish connection between poles
              const filtered_pole_list_not_connected_dtr = all_poles.filter(function (el) {
                return el.prev_pole_id !== "-1"
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
                        lat: _ele["latitude"],
                        lng: _ele["longitude"]
                      }
                    ],
                    asset_from: "pole",
                    asset_to: "pole",
                    parent_substation_id: meter_dtr_info[0].parent_substation_id,
                    parent_feeder_id: meter_dtr_info[0].parent_feeder_id,
                    parent_dtr_id: meter_details[0]["site_id"]
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
                      lat: meter_dtr_info[0].latitude,
                      lng: meter_dtr_info[0].longitude
                    },
                    //DCU Lat and Long
                    {
                      lat: _ele["latitude"],
                      lng: _ele["longitude"]
                    }
                  ],
                  asset_from: "dtr",
                  asset_to: "dcu",
                  parent_substation_id: meter_dtr_info[0].parent_substation_id,
                  parent_feeder_id: meter_dtr_info[0].parent_feeder_id,
                  parent_dtr_id: meter_details[0]["site_id"]
                }
                polyline_new.push(polyline_temp)
              }
            }

            // Add Polylines between Repeater and Pole
            if (all_repeater.length > 0) {
              for (const _ele of all_repeater) {
                //Get pole id repeater is connected to
                const repeater_pole_id = _ele["pole_id"]

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
                        lat: _ele["latitude"],
                        lng: _ele["longitude"]
                      }
                    ],
                    asset_from: "pole",
                    asset_to: "repeater",
                    parent_substation_id: meter_dtr_info[0].parent_substation_id,
                    parent_feeder_id: meter_dtr_info[0].parent_feeder_id,
                    parent_dtr_id: meter_details[0]["site_id"]
                  }
                  polyline_new.push(polyLine_temp)
                }
              }
            }

            //3. Updated Marker List
            const updated_markers = [
              ...markers.responseData,
              ...all_meters,
              ...all_poles,
              ...all_dcu,
              ...all_repeater
            ]

            //Updated Map Center coordinates
            const initMapCenter = {
              Lat: meter_details[0]["latitude"],
              Long: meter_details[0]["longitude"]
            }

            // dispatch(handleGISMapMarkerData(updated_markers))
            batch(() => {
              dispatch(handleGISFilterSelected([]))
              // dispatch(
              //     handleMDMSHierarchyProgress({
              //         project_type: location.pathname.split('/')[1],
              //         project_name: props.project,
              //         module_name: 'mdms',
              //         pss_name: meter_dtr_info[0].parent_substation_id,
              //         feeder_name: meter_dtr_info[0].parent_feeder_id,
              //         dtr_name: meter_details[0]['site_id'],
              //         user_name: meter_details[0]['asset_name'],
              //         mdms_state: 'userConsumption'
              //     })
              // )
              //Clear All User profile Data from redux store
              dispatch(handleConsumerProfileInformationData([], true))
              dispatch(handleConsumerTotalConsumptionData([], true))
              dispatch(handleConsumerTotalRechargesData([], true))
              dispatch(handleConsumerTopAlertsData([], true))
              dispatch(handleCommandInfoData([], true))

              dispatch(handleGISMapMarkerData(updated_markers))
              dispatch(handleGISMapInitCenterData(initMapCenter))
              dispatch(handleGISMapPolyLineData([...polyline["responseData"], ...polyline_new]))
              dispatch(handleGISMapZoom(21))
              dispatch(handleGISMapUpdatedCenter(initMapCenter))

              // ResetMapCenter
              dispatch(
                handleGISMapUpdatedCenter({
                  lat: meter_details[0]["latitude"],
                  lng: meter_details[0]["longitude"]
                })
              )
              // if (mapZoom === 20) {
              //     dispatch(handleGISMapZoom(19))
              // } else if (mapZoom === 19) {
              //     dispatch(handleGISMapZoom(20))
              // } else {
              //     dispatch(handleGISMapZoom(20))
              // }
            })
          }
        }
      }
    }
  }

  return (
    <InputGroup>
      <Input
        type='text'
        onChange={handleChange}
        placeholder='Search for meter serial number/Consumer ID/ Sc No.'
      />
      <Button color='primary' onClick={onSearchButtonClicked}>
        <Search size={12} />
      </Button>
    </InputGroup>
  )
}
export default MeterSearch
