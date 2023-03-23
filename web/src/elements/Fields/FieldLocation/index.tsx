//this is the component integrated in buttonNewPublish to display the location. It shows the current location and has a button to change the location that displays a picker with the differents location options for the network
import React, { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';

import Btn, { BtnType, ContentAlignment } from 'elements/Btn';
import MarkerSelectorMap from 'components/map/LeafletMap/MarkerSelectorMap';
import { useRef } from 'store/Store';
import { GlobalState, store } from 'pages';
import { DropDownWhere } from 'elements/Dropdown/DropDownWhere';
import router from 'next/router';
import t from 'i18n';
import { GeoService } from 'services/Geo';
import { FindAddress } from 'state/Explore';
import { SetupDtoOut } from 'shared/entities/setup.entity';
export default function FieldLocation({
  validationErrors,
  setValue,
  watch,
  defaultZoom,
  markerImage,
  markerCaption = '?',
  markerColor
}) {

  const [showHideMenu, setHideMenu] = useState(false);
  const [center, setCenter] = useState(['41.6869', '-7.663206']);
  const [address, setAddress] = useState('-');
  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)
  const [radius, setRadius] = useState(1)

  

  const selectedNetwork = useRef(
    store,
    (state: GlobalState) => state.networks.selectedNetwork,
  );

  const config: SetupDtoOut = useRef(
    store,
    (state: GlobalState) => state.config,
  );

  const onClick = (e, zoom) => {
    const newCenter = [
      (Math.round(e.lat * 10000) / 10000).toString(),
      (Math.round(e.lng * 10000) / 10000).toString(),
    ];

    setValue('latitude', newCenter[0]);
    setValue('longitude', newCenter[1]);
    setValue('radius', 1);
    setValue('zoom', zoom);
    setCenter(newCenter);

    store.emit(new FindAddress(JSON.stringify({apikey: config.mapifyApiKey,address: newCenter.join('+')}), (place) => {
      const address =  place.results[0].formatted;
      
      setValue('address', address);
      setAddress(address)
    },
    () => {
      console.log('error')
    }));
  };

  useEffect(() => {
    if (selectedNetwork) {
      setCenter(selectedNetwork.location.coordinates);
    }
    setAddress(watch('address'));
    setLatitude(watch('latitude'))
    setLongitude(watch('longitude'))
    setRadius(watch('radius'))
  }, [selectedNetwork]);
  return (
    <>
      <div className="form__field">
        <LocationCoordinates
          longitude={longitude}
          latitude={latitude}
          address={address}
          radius={radius}
        />
        <button
          className="btn"
          onClick={() => setHideMenu(!showHideMenu)}
          
        >
          Change place
        </button>
        {/* <FieldError validationError={validationErrors.latitude} />
        <FieldError validationError={validationErrors.longitude} />
        <FieldError validationError={validationErrors.radius} /> */}
      </div>

      {showHideMenu && (
        <div className="picker__close-container">
          <div className="picker--over picker-box-shadow picker__content picker__options-v">
            <MarkerSelectorMap
              onMarkerClick={onClick}
              markerPosition={
                latitude ? { lat: latitude, lng: longitude } : null
              }
              initMapCenter={center}
              defaultZoom={defaultZoom}
              markerImage={markerImage ? markerImage : selectedNetwork.logo}
              markerCaption={markerCaption ? markerCaption : 'Please select a type'}
              markerColor={markerColor}
            />
            <LocationCoordinates
              longitude={longitude}
              latitude={latitude}
              address={address}
              radius={0}
            />
            {/* <DropDownWhere
              placeholder={t('homeinfo.searchlocation')}
              onSelected={(place) => {
                console.log(place);
                // setCenter(place.coordinates)
              }}
            /> */}
            <Btn
              btnType={BtnType.splitIcon}
              caption="Save"
              contentAlignment={ContentAlignment.center}
              onClick={() => setHideMenu(!showHideMenu)}
            />
          </div>

          <div
            className="picker__close-overlay"
            onClick={() => setHideMenu(false)}
          ></div>
        </div>
      )}
    </>
  );
}

function LocationCoordinates({ longitude, latitude, radius, address }) {
  return (
    <div className="card-button__city card-button__everywhere">
      {address} 
      {latitude || longitude
        ? ` (${latitude}, ${longitude})`
        : 'Where ?'}
        {/* (radius: ${radius} km) */}
    </div>
  );
}
