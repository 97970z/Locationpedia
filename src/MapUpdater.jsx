// MapUpdater.js
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const MapUpdater = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
};

export default MapUpdater;
