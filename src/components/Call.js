import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Send } from 'react-bootstrap-icons';
import { useDispatch } from 'react-redux';
import axios from 'axios'; // Import axios for making HTTP requests

function PhoneForm({ className }) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');

  const handleNameInput = (e) => setName(e.target.value);
  const handleCompanyInput = (e) => setCompany(e.target.value);
  const handlePhoneInput = (e) => setPhone(e.target.value);

  const dispatch = useDispatch();
  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: 'SUBMIT_FORM', payload: { name, company, phone } });

    // Make the POST request to Twilio API
    try {
      const response = await axios.post(`https://api.twilio.com/2010-04-01/Accounts/${process.env.REACT_APP_TWILIO_ACCOUNT_SID}/Calls.json`, {
        Url: `https://handler.twilio.com/twiml/${process.env.REACT_APP_TWIMLBIN_ACCOUNT_SID}`,
        To: '+15558675310',
        From: phone,
      }, {
        auth: {
          username: process.env.REACT_APP_TWILIO_ACCOUNT_SID,
          password: process.env.REACT_APP_TWILIO_AUTH_TOKEN,
        },
      });
      console.log('Call initiated:', response.data);
    } catch (error) {
      console.error('Error initiating call:', error);
    }

    setName('');
    setCompany('');
    setPhone('');
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="formCont">
        <div className="input-group">
          <label htmlFor="name">
            Nome
            <input
              id="name"
              value={name}
              onChange={handleNameInput}
              className="form-control"
              placeholder="Digite seu nome"
            />
          </label>
        </div>
        <div className="input-group">
          <label htmlFor="company">
            Empresa
            <input
              id="company"
              value={company}
              onChange={handleCompanyInput}
              className="form-control"
              placeholder="Digite sua empresa"
            />
          </label>
        </div>
        <div className="input-group">
          <label htmlFor="phone">
            Celular
            <input
              id="phone"
              value={phone}
              onChange={handlePhoneInput}
              className="form-control"
              placeholder="Digite seu celular"
            />
          </label>
        </div>
        <button
          className="btn send-button"
          type="submit"
          aria-label="Submit"
          data-tip="Submit"
        >
          <Send />
        </button>
      </form>
    </div>
  );
}

PhoneForm.propTypes = {
  className: PropTypes.string.isRequired,
};

export default styled(PhoneForm)`
  .form-control {
    margin-bottom: 10px;
  }

  .send-button {
    border: 1px solid #ced4da;
    background: #FFF;
    color: rgba(0,0,0,0.4);
    margin-top: 10px;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 10px;

    @media (max-width: 700px){
      width: 90%;
    }
  }

  .formCont {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    background: azure;

    @media (max-width: 700px){
      display: masonry;
      width: 90%;
    }
  }

  label {
    margin-bottom: 5px;
    font-weight: bold;
  }
`;
