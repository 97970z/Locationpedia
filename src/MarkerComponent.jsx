import { Marker } from 'react-leaflet';
import PopupComponent from './PopupComponent';

const MarkerComponent = ({ locations }) => {
  return locations.map((location, index) => {
    return (
      <Marker
        key={index}
        position={location.coordinates}
        onClick={() => console.log('Marker clicked!')}
      >
        {/* <PopupComponent locationId={location.id} location={location} /> */}
        <PopupComponent location={location} />
      </Marker>
    );
  });
};

export default MarkerComponent;
