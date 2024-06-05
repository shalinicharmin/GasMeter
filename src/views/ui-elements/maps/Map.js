/* global google */
import React, { Component, useState, useEffect } from "react"
import { Map, Marker, InfoWindow, GoogleApiWrapper, Polyline } from "google-maps-react"
import CardInfoWindow from "@src/views/ui-elements/cards/actions/cardInfoWindow"
import { useSelector, useDispatch, batch } from "react-redux"
import useJwt from "@src/auth/jwt/useJwt"
import { useLocation, useHistory } from "react-router-dom"
import authLogout from "../../../auth/jwt/logoutlogic"

// Reference URL:
// https://stackblitz.com/edit/react-bxuavz?file=index.js

class MarkersList extends React.Component {
  constructor(props) {
    super(props)
    this.markersRendered = false
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      JSON.stringify(this.props.places) === JSON.stringify(nextProps.places) &&
      this.props.showPoleLabel === nextProps.showPoleLabel &&
      this.markersRendered
    ) {
      return false
    }
    this.markersRendered = true
    return true
  }

  render() {
    return (
      <span>
        {this.props.places.map((place, i) => {
          if (place.asset_type === "DTR" && this.props.filter_applied === "No") {
            return (
              <Marker
                {...this.props}
                key={i}
                data={place}
                icon={{
                  url: this.props.dtr
                }}
                //name={place.site_name}
                position={{ lat: place.latitude, lng: place.longitude }}
              />
            )
          } else if (place.asset_type === "Pole" && this.props.showPoleLabel) {
            return (
              <Marker
                {...this.props}
                key={i}
                data={place}
                icon={{
                  url: this.props.pole,
                  labelOrigin: new google.maps.Point(0, 40)
                }}
                //name={place.site_name}
                label={{
                  text: place.asset_name,
                  color: "#FF0000",
                  fontSize: "8px"
                }}
                position={{ lat: place.latitude, lng: place.longitude }}
              />
            )
          } else if (place.asset_type === "Pole" && !this.props.showPoleLabel) {
            return (
              <Marker
                {...this.props}
                key={i}
                data={place}
                icon={{
                  url: this.props.pole,
                  labelOrigin: new google.maps.Point(0, 40)
                }}
                position={{ lat: place.latitude, lng: place.longitude }}
              />
            )
          } else if (place.asset_type === "DCU") {
            return (
              <Marker
                {...this.props}
                key={i}
                data={place}
                icon={{
                  url: this.props.dcu,
                  labelOrigin: new google.maps.Point(0, 40)
                }}
                //name={place.site_name}
                label={{
                  text: place.asset_name,
                  color: "#FF0000",
                  fontSize: "8px"
                }}
                position={{ lat: place.latitude, lng: place.longitude }}
              />
            )
          } else if (place.asset_type === "Repeater") {
            return (
              <Marker
                {...this.props}
                key={i}
                data={place}
                icon={{
                  url: this.props.repeater,
                  labelOrigin: new google.maps.Point(0, 40)
                }}
                //name={place.site_name}
                // label={{
                //     text: place.asset_name,
                //     color: '#FF0000',
                //     fontSize: '8px'
                // }}
                position={{ lat: place.latitude, lng: place.longitude }}
              />
            )
          } else if (place.asset_type === "Meter" && this.props.filter_applied === "No") {
            // Check If Meter is searched and highlight asset accordingly
            if (place.asset_searched === "Yes") {
              return (
                <Marker
                  {...this.props}
                  key={i}
                  data={place}
                  // label={{
                  //     text: place.asset_name,
                  //     color: '#000000',
                  //     fontSize: '8px'
                  // }}
                  icon={{
                    url: this.props.meter_searched,
                    labelOrigin: new google.maps.Point(70, 10)
                  }}
                  //name={place.site_name}
                  position={{ lat: place.latitude, lng: place.longitude }}
                />
              )
            } else {
              if (place.meter_installed === "yes") {
                return (
                  <Marker
                    {...this.props}
                    key={i}
                    data={place}
                    // label={{
                    //     text: place.asset_name,
                    //     color: '#000000',
                    //     fontSize: '8px'
                    // }}
                    icon={{
                      url: this.props.meter,
                      labelOrigin: new google.maps.Point(70, 10)
                    }}
                    //name={place.site_name}
                    position={{ lat: place.latitude, lng: place.longitude }}
                  />
                )
              } else if (place.meter_installed === "no") {
                return (
                  <Marker
                    {...this.props}
                    key={i}
                    data={place}
                    // label={{
                    //     text: place.asset_name,
                    //     color: '#000000',
                    //     fontSize: '8px'
                    // }}
                    icon={{
                      url: this.props.meter_installed_no,
                      labelOrigin: new google.maps.Point(70, 10)
                    }}
                    //name={place.site_name}
                    position={{ lat: place.latitude, lng: place.longitude }}
                  />
                )
              }
            }
          } else if (
            place.asset_type === "DTR" &&
            this.props.filter_applied === "Yes" &&
            place.filter_matched === "yes"
          ) {
            return (
              <Marker
                {...this.props}
                key={i}
                data={place}
                icon={{
                  url: this.props.dtr_filter_yes,
                  labelOrigin: new google.maps.Point(15, 15)
                }}
                // label={{
                //     text: place.meter_count.toString(),
                //     color: '#000000',
                //     fontSize: '9px'
                // }}
                //name={place.site_name}
                position={{ lat: place.latitude, lng: place.longitude }}
              />
            )
          } else if (
            place.asset_type === "DTR" &&
            this.props.filter_applied === "Yes" &&
            place.filter_matched === "no"
          ) {
            return (
              <Marker
                {...this.props}
                key={i}
                data={place}
                icon={{
                  url: this.props.dtr_filter_no,
                  labelOrigin: new google.maps.Point(15, 15)
                }}
                // label={{
                //     text: place.meter_count.toString(),
                //     color: '#000000',
                //     fontSize: '9px'
                // }}
                //name={place.site_name}
                position={{ lat: place.latitude, lng: place.longitude }}
              />
            )
          } else if (
            place.asset_type === "Meter" &&
            this.props.filter_applied === "Yes" &&
            place.filter_matched === "yes" &&
            place.meter_installed === "yes"
          ) {
            return (
              <Marker
                {...this.props}
                key={i}
                data={place}
                // label={{
                //     text: place.asset_name,
                //     color: '#000000',
                //     fontSize: '8px'
                // }}
                icon={{
                  url: this.props.meter_filter_yes,
                  labelOrigin: new google.maps.Point(70, 10)
                }}
                //name={place.site_name}
                position={{ lat: place.latitude, lng: place.longitude }}
              />
            )
          } else if (
            place.asset_type === "Meter" &&
            this.props.filter_applied === "Yes" &&
            place.filter_matched === "no" &&
            place.meter_installed === "yes"
          ) {
            return (
              <Marker
                {...this.props}
                key={i}
                data={place}
                // label={{
                //     text: place.asset_name,
                //     color: '#000000',
                //     fontSize: '8px'
                // }}
                icon={{
                  url: this.props.meter_filter_no,
                  labelOrigin: new google.maps.Point(70, 10)
                }}
                //name={place.site_name}
                position={{ lat: place.latitude, lng: place.longitude }}
              />
            )
          } else if (
            place.asset_type === "Meter" &&
            this.props.filter_applied === "Yes" &&
            place.filter_matched === "no" &&
            place.meter_installed === "no"
          ) {
            return (
              <Marker
                {...this.props}
                key={i}
                data={place}
                // label={{
                //     text: place.asset_name,
                //     color: '#000000',
                //     fontSize: '8px'
                // }}
                icon={{
                  url: this.props.meter_installed_no,
                  labelOrigin: new google.maps.Point(70, 10)
                }}
                //name={place.site_name}
                position={{ lat: place.latitude, lng: place.longitude }}
              />
            )
          } else if (
            place.asset_type === "Meter" &&
            this.props.filter_applied === "Yes" &&
            place.filter_matched === "yes" &&
            place.meter_installed === "no"
          ) {
            return (
              <Marker
                {...this.props}
                key={i}
                data={place}
                // label={{
                //     text: place.asset_name,
                //     color: '#000000',
                //     fontSize: '8px'
                // }}
                icon={{
                  url: this.props.meter_installed_no,
                  labelOrigin: new google.maps.Point(70, 10)
                }}
                //name={place.site_name}
                position={{ lat: place.latitude, lng: place.longitude }}
              />
            )
          }
        })}
      </span>
    )
  }
}

const MapContainer = (props) => {
  //Redux Observer
  const markers = useSelector((state) => state.UtilityGISMapsMarkerReducer)
  const polylines = useSelector((state) => state.UtilityGISMapsPolyLineReducer)
  const initMapCenter = useSelector((state) => state.UtilityGISMapsCenterReducer)
  const zoom_value = useSelector((state) => state.UtilityGISMapsZoomReducer)
  const MapCenter = useSelector((state) => state.UtilityGISMapsUpdatedCenterReducer.responseData)

  //Redux observer for Filter selected
  const AlreadySelectedFilter = useSelector((state) => state.UtilityGISFilterSelectedReducer)
  let filter_applied = "No"
  if (AlreadySelectedFilter.responseData.length > 0) {
    filter_applied = "Yes"
  }

  //Locally Managed State
  const [showInfoWindow, setShowInfoWindow] = useState(false)
  const [activeMarker, setActiveMarker] = useState({})
  const [selectedPlace, setSelectedPlace] = useState({})
  const [ToolTipData, setToolTipData] = useState([])

  const dispatch = useDispatch()
  const history = useHistory()

  // Logout User
  const [logout, setLogout] = useState(false)
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch)
    }
  }, [logout])

  const fetchGISToolTipData = async (params) => {
    return await useJwt
      .getGISHoveringToolTipData(params)
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

  const fetchData = async (dtr_id) => {
    const params = {
      project: props.project,
      type: "dtr",
      unique_id: dtr_id
    }
    const [statusCode, response] = await fetchGISToolTipData(params)

    if (statusCode) {
      if (statusCode === 200) {
        const data = response.data.data.result.stat
        const _tooltip_data = []
        for (const _ele of data) {
          const _temp = {}
          _temp[_ele["title"]] = _ele["value"]
          _tooltip_data.push(_temp)
        }
        setToolTipData(_tooltip_data)
        // setLoading(false)
      } else if (statusCode === 401 || statusCode === 403) {
        setLogout(true)
      }
    }
  }

  const handleMouseOver = (markerProps, marker, e) => {
    if (markerProps.data["asset_type"] === "DTR") {
      fetchData(markerProps.data["asset_id"])

      // const initMapCenter = { Lat: markerProps.data['latitude'], Long: markerProps.data['longitude'] }
      // dispatch(handleGISMapInitCenterData(initMapCenter))
      setShowInfoWindow(true)
      setActiveMarker(marker)
      setSelectedPlace(markerProps.data)
    }
  }

  const handleMouseClick = (markerProps, marker, e) => {
    props.handleMapsMarkerClicked(markerProps, marker, e)
    //setMapCenter(props.initMapCenter)
    // setShowCenter({ lat: markerProps.data['latitude'], lng: markerProps.data['longitude'] })
  }

  return (
    <Map
      google={props.google}
      zoom={zoom_value["responseData"]}
      initialCenter={{
        lat: initMapCenter["responseData"]["Lat"],
        lng: initMapCenter["responseData"]["Long"]
      }}
      center={MapCenter}
      containerStyle={{
        position: "relative",
        width: "100%",
        height: `${window.innerHeight - 140}px`
      }}
      fullscreenControl={false}
      streetViewControl={false}
    >
      <MarkersList
        places={markers["responseData"]}
        onClick={handleMouseClick}
        onMouseover={handleMouseOver}
        substation={props.substation}
        feeder={props.feeder}
        dtr={props.dtr}
        meter={props.meter}
        pole={props.pole}
        dcu={props.dcu}
        repeater={props.repeater}
        dtr_filter_no={props.dtr_filter_no}
        dtr_filter_yes={props.dtr_filter_yes}
        meter_filter_no={props.meter_filter_no}
        meter_filter_yes={props.meter_filter_yes}
        meter_installed_no={props.meter_installed_no}
        meter_searched={props.meter_searched}
        filter_applied={filter_applied}
        showPoleLabel={props.showPoleLabel}
      />
      {showInfoWindow ? (
        <InfoWindow marker={activeMarker} visible={true}>
          <CardInfoWindow
            props={{
              name: selectedPlace.asset_name,
              asset_type: selectedPlace.asset_type,
              id: selectedPlace.site_id,
              project: props.project,
              load: true,
              filter: ToolTipData
            }}
          />
        </InfoWindow>
      ) : null}

      {polylines["responseData"].map((polyline, index) => {
        if (polyline["asset_from"] === "dtr" && polyline["asset_to"] === "pole") {
          return (
            <Polyline
              key={index}
              defaultPosition={props.center}
              path={polyline["path"]}
              geodesic={true}
              strokeColor='#FF0000'
              strokeOpacity={1.0}
              strokeWeight={0.5}
            />
          )
        } else if (polyline["asset_from"] === "dtr" && polyline["asset_to"] === "dcu") {
          return (
            <Polyline
              key={index}
              defaultPosition={props.center}
              path={polyline["path"]}
              geodesic={true}
              strokeColor='#FF0000'
              strokeOpacity={1.0}
              strokeWeight={0.5}
            />
          )
        } else if (polyline["asset_from"] === "pole" && polyline["asset_to"] === "pole") {
          return (
            <Polyline
              key={index}
              defaultPosition={props.center}
              path={polyline["path"]}
              geodesic={true}
              strokeColor='#FF0000'
              strokeOpacity={1.0}
              strokeWeight={0.5}
            />
          )
        } else if (polyline["asset_from"] === "pole" && polyline["asset_to"] === "meter") {
          return (
            <Polyline
              key={index}
              defaultPosition={props.center}
              path={polyline["path"]}
              geodesic={true}
              strokeColor='#FF0000'
              strokeOpacity={1.0}
              strokeWeight={0.5}
            />
          )
        } else if (polyline["asset_from"] === "pole" && polyline["asset_to"] === "repeater") {
          return (
            <Polyline
              key={index}
              defaultPosition={props.center}
              path={polyline["path"]}
              geodesic={true}
              strokeColor='#FF0000'
              strokeOpacity={1.0}
              strokeWeight={0.5}
            />
          )
        }
      })}
    </Map>
  )
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyApDFSarHOdO8oQf2jWYg2Gi4ky8qRBm8w",
  language: "English",
  libraries: []
})(MapContainer)
