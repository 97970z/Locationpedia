import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, useMapEvents, GeoJSON } from 'react-leaflet';
import MarkerComponent from './MarkerComponent';
import SearchBar from './SearchBar';
import MapUpdater from './MapUpdater';
import { firestore } from './firebase';
import { collection, query, onSnapshot, addDoc } from 'firebase/firestore';

const MapComponent = ({ currentLocation }) => {
  const defaultCenter = [37.5666791, 126.9782914];
  const defaultZoom = 15;

  const [locations, setLocations] = useState([]);
  const [zoom, setZoom] = useState(defaultZoom);

  const [clickedLocation, setClickedLocation] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [boundaryData, setBoundaryData] = useState(null);

  useEffect(() => {
    if (currentLocation) {
      setCenter([
        currentLocation.coordinates.lat,
        currentLocation.coordinates.lng,
      ]);
      setZoom(20); // or whatever zoom level you prefer
    }
  }, [currentLocation]);

  useEffect(() => {
    const q = query(collection(firestore, 'locations'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newLocations = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log('New locations:', newLocations);
      setLocations(newLocations);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  async function initializeFirestore(
    lat,
    lng,
    locationName,
    locationDescription
  ) {
    console.log('Initializing Firestore...');
    const docRef = await addDoc(collection(firestore, 'locations'), {
      name: locationName,
      description: locationDescription,
      coordinates: {
        lat: lat,
        lng: lng,
      },
      comments: [],
      photos: [],
    });
    console.log('Document written with ID: ', docRef.id);
  }

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;

    const locationName = window.prompt(
      'Please enter a name for this location:'
    );
    const locationDescription = window.prompt(
      'Please enter a description for this location:'
    );

    if (locationName && locationDescription) {
      initializeFirestore(lat, lng, locationName, locationDescription)
        .then(() => {
          console.log('Location saved successfully!');
        })
        .catch((error) => {
          console.error('Error saving location:', error);
        });
    } else {
      alert('You must provide a name and description for the location.');
    }
  };

  const handleSearch = async (address) => {
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
        const lat = result.geometry.lat;
        const lng = result.geometry.lng;
        const { southwest, northeast } = result.bounds;

        setCenter([lat, lng]);

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

        console.log('Boundary data:', geoJSONData);

        setBoundaryData(geoJSONData);
      } else {
        alert('Location not found');
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
    }
  };

  return (
    <>
      <MapContainer
        center={center}
        zoom={defaultZoom}
        style={{ height: '700px', width: '100%' }}
        className="map-container mb-3 mt-3 w-100 mx-auto border border-primary rounded shadow"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MarkerComponent locations={locations} />
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
      {clickedLocation && (
        <div>
          Latitude: {clickedLocation.lat}, Longitude: {clickedLocation.lng}
        </div>
      )}
    </>
  );
};

const ClickEventHandler = ({ onClick }) => {
  const map = useMapEvents({
    click: onClick,
  });

  return null;
};

export default MapComponent;
