import { Component, useState } from "react"
import { Map, Marker, InfoWindow, GoogleApiWrapper } from "google-maps-react"
// import {useState} from 'react'
import Markers from "./markers"
import MarkerToolTip from "./markerToolTip"

const MapContainer = (props) => {
  const [showingInfoWindow, sethowingInfoWindow] = useState(false)
  const [activeMarker, setActiveMarker] = useState({})
  const [selectedPlace, setSelectedPlace] = useState({})

  const handleMouseOver = (propsLocal, marker, e) => {
    try {
      if (selectedPlace.hasOwnProperty("site_name")) {
        if (selectedPlace.site_name !== propsLocal.site_name) {
          setActiveMarker(marker)
          setSelectedPlace(propsLocal)
          sethowingInfoWindow(true)
          // this.setState({
          //   selectedPlace: props,
          //   activeMarker: marker,
          //   showingInfoWindow: true
          // })
        }
      } else {
        // this.setState({
        //   selectedPlace: props,
        //   activeMarker: marker,
        //   showingInfoWindow: true
        // })
        setActiveMarker(marker)
        setSelectedPlace(propsLocal)
        sethowingInfoWindow(true)
      }
    } catch (err) {
      // this.setState({
      //   selectedPlace: props,
      //   activeMarker: marker,
      //   showingInfoWindow: true
      // })
      setActiveMarker(marker)
      setSelectedPlace(propsLocal)
      sethowingInfoWindow(true)
    }
  }

  const handleOnMouseClick = (propsLocal, marker, e) => {
    try {
      if (selectedPlace.hasOwnProperty("name")) {
        if (selectedPlace.name !== propsLocal.name) {
          setActiveMarker(marker)
          setSelectedPlace(propsLocal)
          sethowingInfoWindow(true)
          // this.setState({
          //   selectedPlace: props,
          //   activeMarker: marker,
          //   showingInfoWindow: true
          // })
        }
      } else {
        // this.setState({
        //   selectedPlace: props,
        //   activeMarker: marker,
        //   showingInfoWindow: true
        // })
        setActiveMarker(marker)
        setSelectedPlace(propsLocal)
        sethowingInfoWindow(true)
      }
    } catch (err) {
      // this.setState({
      //   selectedPlace: props,
      //   activeMarker: marker,
      //   showingInfoWindow: true
      // })
      setActiveMarker(marker)
      setSelectedPlace(propsLocal)
      sethowingInfoWindow(true)
    }
  }

  const style = {
    width: "97.5%",
    height: "91%"
  }
  const data = props.data

  return (
    <Map
      google={props.google}
      style={style}
      zoom={15}
      initialCenter={{
        lat: data[0].latitude,
        lng: data[0].longitude
      }}
    >
      <Markers places={props.data} onMouseover={handleMouseOver} icon={props.icon} />
      <InfoWindow marker={activeMarker} visible={showingInfoWindow}>
        <h4>{selectedPlace.site_name}</h4>
      </InfoWindow>
    </Map>
  )
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyApDFSarHOdO8oQf2jWYg2Gi4ky8qRBm8w",
  language: "English"
})(MapContainer)
