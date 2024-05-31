//this is the component integrated in buttonNewPublish to display the location. It shows the current location and has a button to change the location that displays a picker with the differents location options for the network
import React, { useEffect, useState } from 'react';
import Btn, { BtnType, ContentAlignment } from 'elements/Btn';
import MarkerSelectorMap from 'components/map/Map/MarkerSelectorMap';
import { useStore } from 'store/Store';
import { GlobalState, store } from 'pages';
import { SetupDtoOut } from 'shared/entities/setup.entity';
import DropDownSearchLocation from 'elements/DropDownSearchLocation';
import t from 'i18n';
import { roundCoord } from 'shared/honeycomb.utils';
import { ReverseGeo } from 'state/Explore';
import { FieldCheckbox } from '../FieldCheckbox';
import PickerField from 'components/picker/PickerField';
export default function FieldLocation({
  validationError,
  markerImage,
  markerCaption = '?',
  markerColor,
  markerAddress,
  selectedNetwork,
  updateAddress,
  setMarkerPosition,
  markerPosition,
  explain = '',
  label,
  watch,
  setValue,
}) {
  const config: SetupDtoOut = useStore(
    store,
    (state: GlobalState) => state.config,
  );

  const [place, setPlace] = useState(null);

  let closeMenu = () => {
    setShowPopup(() => false);
  };

  const onMapClick = (latLng) => {
    setMarkerPosition(latLng);
    requestAddressForPosition(latLng);
  };

  const [showPopup, setShowPopup] =  useState(false)
  const handleSelectedPlace = (newPlace) => {
    setMarkerPosition([newPlace.geometry.lat, newPlace.geometry.lng]);
    setPlace(() => newPlace);
  };

  useEffect(() => {
    if (place) {
      if (hideAddress) {
        updateAddress(place.formatted_city);
      } else {
        updateAddress(place.formatted);
      }
    }
  }, [place]);
  const hideAddress = watch('hideAddress');
  const latitude = watch('latitude');
  const longitude = watch('longitude');

  const requestAddressForPosition = (markerPosition) => {
    store.emit(
      new ReverseGeo(
        markerPosition[0],
        markerPosition[1],
        (place) => {
          if (!place) {
            updateAddress(t('button.unknownPlace')[0]);
          } else {
            setPlace(() => place);
          }
          setMarkerPosition(() => markerPosition);
        },
        () => {
          console.log(
            'error, no address found, mapifyapi not configured?',
          );
        },
      ),
    );
  };

  useEffect(() => {
    if (selectedNetwork && !markerPosition) {
      setMarkerPosition(selectedNetwork.exploreSettings.center);
      requestAddressForPosition(selectedNetwork.exploreSettings.center)
    }
  }, [selectedNetwork]);

  useEffect(() => {
    if (longitude && latitude) {
      setMarkerPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (place) {
      if (hideAddress) {
        updateAddress(place.formatted_city);
      } else {
        updateAddress(place.formatted);
      }
    }
  }, [hideAddress]);

  const closePopup = () => setShowPopup(() => false)
  const openPopup = () => setShowPopup(() => true)
  return (
          <PickerField 
            showPopup={showPopup} 
            validationError={validationError} 
            label={t('button.whereLabel')}
            btnLabel={markerPosition ? <LocationCoordinates
                latitude={markerPosition[0]}
                longitude={markerPosition[1]}
                address={markerAddress}
                label={label}
              /> : label} 
            headerText={t('picker.headerText')} 
            explain={t("button.whereExplain")}
            openPopup={openPopup} 
            closePopup={closePopup}>
            <DropDownSearchLocation
              placeholder={t('homeinfo.searchlocation')}
              handleSelectedPlace={handleSelectedPlace}
            />
            <MarkerSelectorMap
              onMapClick={onMapClick}
              defaultZoom={selectedNetwork.exploreSettings.zoom}
              markerColor={markerColor ? markerColor : 'pink'}
              markerPosition={markerPosition}
              markerCaption={markerCaption}
              markerImage={markerImage}
              showHexagon={watch('hideAddress')}
            />
            <FieldCheckbox
              name="hideAddress"
              defaultValue={watch('hideAddress')}
              text={t('button.hideAddress')}
              onChanged={(value) => setValue('hideAddress', value)}
            />
            <Btn
              btnType={BtnType.submit}
              caption={t('common.save')}
              contentAlignment={ContentAlignment.center}
              onClick={() => setShowPopup(!showPopup)}
            />
       </PickerField>
  );
}

function LocationCoordinates({
  latitude,
  longitude,
  address,
  label,
}) {
  return (
    <>
      {address && address.length > 1 ? (
        <>
          <span>{address}</span>
          <span>
            {' '}
            ({roundCoord(latitude)},{roundCoord(longitude)})
          </span>
          {/* (radius: ${radius} km) */}
        </>
      ) : (
        <>{label}</>
      )}
    </>
  );
}
