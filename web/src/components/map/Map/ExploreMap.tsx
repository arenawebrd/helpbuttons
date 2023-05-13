import React, { useEffect, useState } from 'react';
import { Point } from 'pigeon-maps';
import { Button } from 'shared/entities/button.entity';
import { MarkerButton, MarkerButtonPopup } from './MarkerButton';
import { store } from 'pages';
import {
  updateCurrentButton,
} from 'state/Explore';
import { HbMap } from '.';
const SCROLL_PIXELS_FOR_ZOOM_LEVEL = 150;

export default function ExploreMap({
  filteredButtons,
  currentButton,
  handleBoundsChange,
  mapCenter,
  mapZoom,
  setMapCenter,
  setMapZoom,
}) {
  const onBoundsChanged = ({ center, zoom, bounds, initial }) => {
    handleBoundsChange(bounds, center, zoom);
  };

  const handleMarkerClicked = (button: Button) => {
    setMapCenter([button.latitude, button.longitude]);
    store.emit(new updateCurrentButton(button));
  };
  const handleMapClicked = ({ event, latLng, pixel }) => {
    setMapCenter(latLng);

    store.emit(new updateCurrentButton(null));
  }; 
  
  return (
    <>
        <HbMap
          mapCenter={mapCenter}
          mapZoom={mapZoom}
          setMapZoom={setMapZoom}
          handleBoundsChange={onBoundsChanged}
          handleMapClick={handleMapClicked}
          setMapCenter={setMapCenter}
        >
          {filteredButtons.map((button: Button, idx) => (
            <MarkerButton
              key={idx}
              anchor={[button.latitude, button.longitude]}
              offset={[35, 65]}
              button={button}
              handleMarkerClicked={handleMarkerClicked}
              currentButtonId={currentButton?.id}
            />
          ))}

          {currentButton && (
            <MarkerButtonPopup
              anchor={[
                currentButton.latitude,
                currentButton.longitude,
              ]}
              offset={[155, 328]}
              button={currentButton}
            />
          )}
        </HbMap>
        </>
  );
}
