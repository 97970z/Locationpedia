import React, { useState } from 'react';
import { Form, Button, InputGroup, FormControl } from 'react-bootstrap';

const SearchBar = ({ onSearch }) => {
  const [address, setAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(address);
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-3 mt-3 w-50 mx-auto">
      <InputGroup>
        <FormControl
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Search for an address"
          aria-label="Search for an address"
          aria-describedby="basic-addon2"
          name="address"
        />
        <Button variant="outline-primary" id="button-addon2" type="submit">
          Search
        </Button>
      </InputGroup>
    </Form>
  );
};

export default SearchBar;
