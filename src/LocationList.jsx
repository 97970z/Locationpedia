import React, { useState, useEffect } from 'react';
import { firestore } from './firebase';
import {
  collection,
  onSnapshot,
  query,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import {
  Tab,
  Tabs,
  Button,
  ListGroup,
  Pagination,
  Accordion,
} from 'react-bootstrap';

const LocationList = ({ onMoveLocation }) => {
  const [locations, setLocations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const locationsPerPage = 7;

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

  // Get unique countries
  const countries = [...new Set(locations.map((location) => location.country))];

  const renderLocationList = (locationsList) => {
    // Get current page locations
    const indexOfLastLocation = currentPage * locationsPerPage;
    const indexOfFirstLocation = indexOfLastLocation - locationsPerPage;
    const currentLocations = locationsList.slice(
      indexOfFirstLocation,
      indexOfLastLocation
    );

    return (
      <Accordion>
        {currentLocations.map((location, index) => (
          <Accordion key={location.id} defaultActiveKey="0">
            <Accordion.Item>
              <Accordion.Header>
                <Accordion
                  eventkey={location.id.toString()}
                  style={{ width: '100%' }}
                >
                  <strong>{location.name}</strong>{' '}
                </Accordion>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteLocation(location.id);
                  }}
                  style={{ float: 'right' }}
                >
                  Delete
                </Button>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveLocation(location);
                  }}
                  style={{ float: 'right', marginRight: '5px' }}
                >
                  Move
                </Button>
              </Accordion.Header>
              <Accordion.Body>
                <p>{location.description}</p>
                <p>국가명: {location.country}</p>
                <p>
                  좌표: [{location.coordinates.lat}, {location.coordinates.lng}]
                </p>
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
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        ))}
      </Accordion>
    );
  };

  // Generate pagination item
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(locations.length / locationsPerPage); i++) {
    pageNumbers.push(
      <Pagination.Item
        key={i}
        active={i === currentPage}
        onClick={() => setCurrentPage(i)}
      >
        {i}
      </Pagination.Item>
    );
  }

  return (
    <Tabs defaultActiveKey="all" id="location-tabs">
      <Tab eventKey="all" title="All">
        <ListGroup className="mt-3 mb-3">
          {renderLocationList(locations)}
        </ListGroup>
        <Pagination>{pageNumbers}</Pagination>
      </Tab>
      {countries.map((country, index) => (
        <Tab eventKey={country} title={country} key={index}>
          <ListGroup className="mt-3 mb-3">
            {renderLocationList(
              locations.filter((location) => location.country === country)
            )}
          </ListGroup>
          <Pagination>{pageNumbers}</Pagination>
        </Tab>
      ))}
    </Tabs>
  );
};

export default LocationList;
