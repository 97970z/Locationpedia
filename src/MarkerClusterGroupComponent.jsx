import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';

const MarkerClusterGroupComponent = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    var markers = L.markerClusterGroup();

    locations.forEach((location) => {
      const marker = L.circleMarker([
        location.coordinates.lat,
        location.coordinates.lng,
      ]);
      markers.addLayer(marker);
    });

    map.addLayer(markers);
    return () => {
      map.removeLayer(markers);
    };
  }, [map, locations]);

  return null;
};

export default MarkerClusterGroupComponent;
