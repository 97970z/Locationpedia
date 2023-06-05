import React, { useState, useEffect } from 'react';
import { firestore } from './firebase';
import {
  collection,
  onSnapshot,
  query,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { Card, Button, ListGroup } from 'react-bootstrap';

const LocationList = ({ onMoveLocation }) => {
  const [locations, setLocations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

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

  const handleMoveLocation = (location) => {
    setCurrentLocation(location);
    onMoveLocation(location);
    console.log(`Moved to location: ${location.name}`);
  };

  const handleDeleteLocation = async (locationId) => {
    try {
      await deleteDoc(doc(collection(firestore, 'locations'), locationId));
      console.log('Location deleted successfully!');
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  };

  return (
    <ListGroup className="mt-3 mb-3">
      {locations.map((location) => (
        <ListGroup.Item key={location.id}>
          <Card>
            <Card.Body>
              <Card.Title>{location.name}</Card.Title>
              <Card.Text>
                {location.description}
                <br />
                Coordinates: [{location.coordinates.lat},{' '}
                {location.coordinates.lng}]
                <br />
                {location.comments.map((comment, index) => (
                  <p key={index}>{comment.text}</p>
                ))}
                {location.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo.path}
                    alt={photo.name}
                    style={{ width: '100px', height: '100px' }}
                  />
                ))}
              </Card.Text>
              <Button
                variant="danger"
                onClick={() => handleDeleteLocation(location.id)}
              >
                Delete
              </Button>
              <Button
                variant="success"
                onClick={() => handleMoveLocation(location)}
              >
                Move
              </Button>
            </Card.Body>
          </Card>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default LocationList;
