import React from 'react';
import { Marker } from 'react-leaflet';
import PopupComponent from './PopupComponent';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

const MarkerComponent = React.memo(({ locations }) => {
  return (
    <MarkerClusterGroup>
      {locations.map((location, index) => {
        return (
          <Marker
            key={index}
            position={location.coordinates}
            onClick={() => console.log('Marker clicked!')}
          >
            <PopupComponent location={location} />
          </Marker>
        );
      })}
    </MarkerClusterGroup>
  );
});

export default MarkerComponent;
