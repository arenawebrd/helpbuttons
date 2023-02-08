import {  useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MarkersButton,
  MarkerSelector,
} from 'components/map/MarkerButton';
import { useRef } from 'store/Store';
import { GlobalState, store } from 'pages';
import { IConfig } from 'services/Setup/config.type';

export default function LeafLetMap({
  center,
  onBoundsChange,
  onMarkerClick,
  markerPosition = null,
  markersButtons = [],
  style = null,
  defaultZoom,
  markerImage = null,
  markerCaption = '?',
  isMarkerSelector = false,

}) {
  const [zoom, setZoom] = useState(defaultZoom);
  const getButtonsOnBounds = (map) => {
    onBoundsChange(map.getBounds());
  };
  
  const config: IConfig = useRef(
    store,
    (state: GlobalState) => state.config,
  );

  return (
    <>
    
      {config && (
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={true}
          style={style}
          whenCreated={(map) => getButtonsOnBounds(map)}
        >
          <TileLayer
            attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
            url={config.leafletTiles}
          />
          
          {(() => {
          if (isMarkerSelector) {
            return (<MarkerSelector
              onClick={onMarkerClick}
              markerImage={markerImage}
              markerPosition={markerPosition}
              markerCaption={markerCaption}
            />)
          }else if (markersButtons) {
            return (<MarkersButton buttons={markersButtons} onBoundsChange={onBoundsChange}
            onMarkerClick={onMarkerClick}
            />)
          }else {
            <>Loading...</>
          }
        })()}
        </MapContainer>
      )}
    </>
  );
}