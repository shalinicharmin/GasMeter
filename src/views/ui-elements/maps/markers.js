import { Map, Marker, InfoWindow, GoogleApiWrapper } from 'google-maps-react'
import React, { Fragment } from 'react'

class MarkersList extends React.Component {
  constructor(props) {
    super(props)
    this.markersRendered = false
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (JSON.stringify(this.props.places) === JSON.stringify(nextProps.places) && this.markersRendered) {
      return false
    }
    this.markersRendered = true
    return true
  }

  render() {
    return (
      <span>
        {this.props.places.map((place, i) => {
          return (
            <Marker
              {...this.props}
              key={i}
              data={place}
              icon={{
                url: this.props.icon
              }}
              //name={place.site_name}
              position={{ lat: place.latitude, lng: place.longitude }}
            />
          )
        })}
      </span>
    )
  }
}

export default MarkersList
