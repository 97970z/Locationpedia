import React, { useState } from 'react';
import MapComponent from './MapComponent';
import LocationList from './LocationList';
import { firestore } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Container, Row, Col } from 'react-bootstrap';
import './App.css';

async function initializeFirestore(lat, lng) {
  console.log('Initializing Firestore...');
  const docRef = await addDoc(collection(firestore, 'locations'), {
    name: 'location name',
    description: 'location description',
    country: 'country',
    coordinates: {
      lat: lat,
      lng: lng,
    },
    comments: [],
    photos: [],
  });
  console.log('Document written with ID: ', docRef.id);
}

function App() {
  const [currentLocation, setCurrentLocation] = useState(null);

  const handleMoveLocation = (location) => {
    setCurrentLocation(location);
  };

  const handleMapClick = (event) => {
    const lat = event.latlng.lat;
    const lng = event.latlng.lng;
    initializeFirestore(lat, lng);
  };

  return (
    <div className="App">
      <Container fluid>
        <Row>
          <Col md={3}>
            <LocationList onMoveLocation={handleMoveLocation} />
          </Col>
          <Col md={9}>
            <MapComponent
              onMapClick={handleMapClick}
              currentLocation={currentLocation}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
