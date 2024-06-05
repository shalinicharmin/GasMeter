import { Map, Marker, InfoWindow, GoogleApiWrapper } from 'google-maps-react'
import { Fragment } from 'react'

const markerToolTips = (props) => {

return (<Fragment>
            <InfoWindow marker={props.activeMarker} visible={props.showingInfoWindow}>
            {props.PlaceName && <h4>{props.PlaceName.name}</h4>}
            </InfoWindow>
        </Fragment>)

}

export default markerToolTips 
