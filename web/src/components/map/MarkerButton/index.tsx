///button marker over the map
import React, { useState } from "react";

import { Marker, Popup, useMapEvents } from "react-leaflet";
import { MarkerIcon, MarkerButton } from "./IconButton";
import CardButtonMap from "components/map/CardButtonMap";


export function MarkerSelector({ onClick, markerPosition, markerImage = null, markerCaption= '?' }) {
  const [position, setPosition] = useState(markerPosition);

  const map = useMapEvents({
    click: (e) => {
      const position = {lat: e.latlng.lat,lng: e.latlng.lng};

      setPosition(position);
      onClick(position);
    },
  });
  
  
  return (
    <>
    {position && 
      <Marker
        position={position}
        icon={MarkerIcon(markerCaption,markerImage)}
      >
      </Marker>
    }
    </>
  );
}

export function CardMarkerButton({ button, children }) {
  return (
    <Marker
      position={
        button.location
          ? {
              lat: button.location.coordinates[0],
              lng: button.location.coordinates[1],
            }
          : { lat: null, lng: null }
      }
      icon={MarkerButton(button)}
    >
      {children}
    </Marker>
  );
}
export function MarkersButton({ buttons, onBoundsChange, ...props }) {
  const map = useMapEvents({
    moveend: (e) => {
      onBoundsChange(map);
    },
  });
  const markers = buttons.map((button, i) => (
    <CardMarkerButton button={button} key={i}>
      <Popup className="card-button-map--wrapper">
        <CardButtonMap
          key={i}
          button={button}
        />
      </Popup>
    </CardMarkerButton>
  ));

  // return <></>
  return markers;
}
