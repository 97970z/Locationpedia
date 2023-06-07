import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, useMapEvents, GeoJSON } from 'react-leaflet';
import MarkerComponent from './MarkerComponent';
import SearchBar from './SearchBar';
import MapUpdater from './MapUpdater';
import { firestore } from './firebase';
import { collection, query, onSnapshot, addDoc } from 'firebase/firestore';
import { Offcanvas, Button, Form } from 'react-bootstrap';

const MapComponent = ({ currentLocation }) => {
  const defaultCenter = [37.5666791, 126.9782914];
  const defaultZoom = 15;

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

  const handleCloseOffCanvas = () => setShowOffCanvas(false);
  const handleShowOffCanvas = () => setShowOffCanvas(true);

  const handleChange = (e) => {
    setLocationData({ ...locationData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (currentLocation) {
      setCenter([
        currentLocation.coordinates.lat,
        currentLocation.coordinates.lng,
      ]);
      setZoom(20);
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
  }

  const handleMarkerClick = async (lat, lng) => {
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
  };

  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    let country = await handleMarkerClick(lat, lng);
    console.log('Country:', country);
    setClickedLocation({ lat, lng, country });
    handleShowOffCanvas();
  };

  // Handle form submission
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
      <Offcanvas show={showOffCanvas} onHide={handleCloseOffCanvas}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Add New Location</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Location Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Location Name"
                name="name"
                value={locationData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter Location Description"
                name="description"
                value={locationData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Save Location
            </Button>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
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
