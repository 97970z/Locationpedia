import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  GeoJSON,
  useMap,
} from 'react-leaflet';
import { collection, query, onSnapshot, addDoc } from 'firebase/firestore';
import MarkerClusterGroupComponent from './MarkerClusterGroupComponent';
import SearchBar from './SearchBar';
import MapUpdater from './MapUpdater';
import LocationForm from './LocationForm';
import { firestore } from './firebase';
import _ from 'lodash';

const defaultCenter = [37.5666791, 126.9782914];
const defaultZoom = 15;
const maxBounds = [
  [-65, -180],
  [65, 180],
];

const MapComponent = ({ currentLocation }) => {
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [locations, setLocations] = useState([]);
  const [zoom, setZoom] = useState(defaultZoom);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [boundaryData, setBoundaryData] = useState(null);
  const [showOffCanvas, setShowOffCanvas] = useState(false);
  const [locationData, setLocationData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    const fetchLocations = async () => {
      const q = query(collection(firestore, 'locations'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newLocations = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLocations(newLocations);
      });
      return () => unsubscribe();
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      setCenter([
        currentLocation.coordinates.lat,
        currentLocation.coordinates.lng,
      ]);
      setZoom(20);
    }
  }, [currentLocation]);

  const handleCloseOffCanvas = () => setShowOffCanvas(false);
  const handleShowOffCanvas = () => setShowOffCanvas(true);
  const handleChange = (e) => {
    setLocationData({ ...locationData, [e.target.name]: e.target.value });
  };

  const initializeFirestore = useCallback(async function (
    lat,
    lng,
    locationName,
    locationDescription,
    country
  ) {
    console.log('Initializing Firestore...');
    const docRef = await addDoc(collection(firestore, 'locations'), {
      name: locationName,
      description: locationDescription,
      country: country,
      coordinates: {
        lat: lat,
        lng: lng,
      },
      comments: [],
      photos: [],
    });
    console.log('Document written with ID: ', docRef.id);
  },
  []);

  const handleMarkerClick = useCallback(async (lat, lng) => {
    console.log('Marker clicked!');
    const apiKey = import.meta.env.VITE_OPENCAGO_API_KEY;
    const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}&limit=1`;

    try {
      const response = await axios.get(apiUrl);
      if (
        response.data &&
        response.data.results &&
        response.data.results.length > 0
      ) {
        const result = response.data.results[0];
        const country = result.components.country;
        console.log(`The marker is located in ${country}`);
        return country;
      } else {
        console.log('Country not found');
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
    }
  }, []);

  const handleMapClick = useCallback(async (e) => {
    const { lat, lng } = e.latlng;
    let country = await handleMarkerClick(lat, lng);
    console.log('Country:', country);
    setClickedLocation({ lat, lng, country });
    handleShowOffCanvas();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (locationData.name && locationData.description) {
      initializeFirestore(
        clickedLocation.lat,
        clickedLocation.lng,
        locationData.name,
        locationData.description,
        clickedLocation.country
      )
        .then(() => {
          console.log('Location saved successfully!');
        })
        .catch((error) => {
          console.error('Error saving location:', error);
        });
      setLocationData({ name: '', description: '' });
      handleCloseOffCanvas();
    } else {
      alert('You must provide a name and description for the location.');
    }
  };

  const handleSearch = _.debounce(async (address) => {
    const response = await getGeoData(address);
    if (response) {
      const { result, geoJSONData } = response;
      setCenter([result.geometry.lat, result.geometry.lng]);
      setBoundaryData(geoJSONData);
    } else {
      alert('Location not found');
    }
  }, 500);

  const handleMyLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter([latitude, longitude]);
      });
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  };

  return (
    <>
      <Button onClick={handleMyLocationClick}>내 위치</Button>
      <MapContainer
        center={center}
        zoom={defaultZoom}
        maxBounds={maxBounds}
        maxBoundsViscosity={1.0}
        style={{ height: '700px', width: '100%' }}
        className="map-container mb-3 mt-3 w-100 mx-auto border border-primary rounded shadow"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <UpdateMap center={mapCenter} />
        <MarkerClusterGroupComponent locations={locations} />
        <ClickEventHandler onClick={handleMapClick} />
        <MapUpdater center={center} zoom={defaultZoom} />

        {boundaryData && (
          <GeoJSON
            key={JSON.stringify(boundaryData)}
            data={boundaryData}
            style={() => ({
              color: '#0000FF',
              weight: 3,
              opacity: 1,
              fillColor: '#0000FF',
              fillOpacity: 0,
            })}
          />
        )}
      </MapContainer>
      <SearchBar onSearch={handleSearch} />
      <LocationForm
        show={showOffCanvas}
        handleClose={handleCloseOffCanvas}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        locationData={locationData}
      />
    </>
  );
};

function UpdateMap({ center }) {
  const map = useMap();
  map.flyTo(center);
  return null;
}

const ClickEventHandler = ({ onClick }) => {
  const map = useMapEvents({
    click: onClick,
  });

  return null;
};

async function getGeoData(address) {
  const apiKey = import.meta.env.VITE_OPENCAGO_API_KEY;
  const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
    address
  )}&key=${apiKey}&limit=1`;

  try {
    const response = await axios.get(apiUrl);

    if (
      response.data &&
      response.data.results &&
      response.data.results.length > 0
    ) {
      const result = response.data.results[0];
      const { southwest, northeast } = result.bounds;

      const geoJSONData = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [southwest.lng, southwest.lat],
                  [southwest.lng, northeast.lat],
                  [northeast.lng, northeast.lat],
                  [northeast.lng, southwest.lat],
                  [southwest.lng, southwest.lat],
                ],
              ],
            },
          },
        ],
      };

      return { result, geoJSONData };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching location data:', error);
    return null;
  }
}

export default MapComponent;
