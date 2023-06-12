import React from 'react';
import { Offcanvas, Button, Form } from 'react-bootstrap';

const LocationForm = React.memo(
  ({ show, handleClose, handleSubmit, handleChange, locationData }) => {
    return (
      <Offcanvas show={show} onHide={handleClose}>
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
    );
  }
);

export default LocationForm;
