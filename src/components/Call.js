import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { TelephoneFill } from 'react-bootstrap-icons';

function PhoneForm({ className }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  return (
    <div className={className}>
      <button type="button" className="control-icon icon" onClick={toggleForm}>
        <TelephoneFill size={35} color="#09c8c8" />
      </button>
      {showForm && (
        <form className="phone-form">
          <div>
            <label htmlFor="name">Nome:</label>
            <input
              type="text"
              id="name"
              name="Nome"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="company">Empresa:</label>
            <input
              type="text"
              id="company"
              name="Empresa"
              value={formData.company}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="phone">Celular:</label>
            <input
              type="text"
              id="phone"
              name="Celular"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
        </form>
      )}
    </div>
  );
}

PhoneForm.propTypes = {
  className: PropTypes.string.isRequired,
};

export default styled(PhoneForm)`
  .control-icon {
    border: none;
    background: none;
    padding: 0.4rem;
    background-color: #09c8c8;
    border-radius: 40px;
    height: 70px;
    width: 70px;
    &:hover {
      background-color: #05a0a0;
    }
  }

  .phone-form {
    display: flex;
    flex-direction: column;
    margin-top: 1rem;
  }

  .phone-form div {
    margin-bottom: 0.5rem;
  }

  .phone-form label {
    margin-right: 0.5rem;
  }

  .phone-form input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
`;
