import React from 'react';
import { Offcanvas, Button, Form } from 'react-bootstrap';

const LocationForm = React.memo(
  ({ show, handleClose, handleSubmit, handleChange, locationData }) => {
    return (
      <Offcanvas show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>장소 추가하기</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>장소 이름</Form.Label>
              <Form.Control
                type="text"
                placeholder="무슨 장소인가요?"
                name="name"
                value={locationData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>장소 설명</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="장소에 대해 설명해주세요."
                name="description"
                value={locationData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              저장하기
            </Button>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    );
  }
);

export default LocationForm;
