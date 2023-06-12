import React from 'react';
import { Marker } from 'react-leaflet';
import PopupComponent from './PopupComponent';

const MarkerComponent = React.memo(({ locations }) => {
  return locations.map((location, index) => {
    return (
      <Marker
        key={index}
        position={location.coordinates}
        onClick={() => console.log('Marker clicked!')}
      >
        <PopupComponent location={location} />
      </Marker>
    );
  });
});

export default MarkerComponent;
