import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Send } from 'react-bootstrap-icons';
import { useDispatch } from 'react-redux';
import axios from 'axios'; // Import axios for making HTTP requests
import InputMask from 'react-input-mask'; // Import InputMask for phone masking

function PhoneForm({ className }) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(''); // State for messages

  const handleNameInput = (e) => setName(e.target.value);
  const handleCompanyInput = (e) => setCompany(e.target.value);
  const handlePhoneInput = (e) => setPhone(e.target.value);

  const dispatch = useDispatch();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.match(/^\+\d{1,3}\(\d{2}\)\d{4,5}-\d{4}$/)) {
      setMessage('Por favor, insira um número de telefone válido com DDI e DDD.');
      return;
    }
    dispatch({ type: 'SUBMIT_FORM', payload: { name, company, phone } });

    // Make the POST request to Twilio API for Call
    try {
      await axios.post(`https://studio.twilio.com/v2/Flows/${process.env.REACT_APP_TWIMLBIN_ACCOUNT_SID}/Executions`, {
        From: '+13374152289',
        To: phone,
        flow: {
          data: {
            name,
            company,
            phone,
          },
        },
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: process.env.REACT_APP_TWILIO_ACCOUNT_SID,
          password: process.env.REACT_APP_TWILIO_AUTH_TOKEN,
        },
      });
      setMessage('Chamada iniciada com sucesso!');
      console.log('Chamada iniciada');
    } catch (error) {
      setMessage('Erro ao iniciar chamada. Por favor, tente novamente.');
      console.error('Erro ao iniciar chamada');
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
              required
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
              required
            />
          </label>
        </div>
        <div className="input-group">
          <label htmlFor="phone">
            Celular
            <InputMask
              mask="+99(99)99999-9999"
              id="phone"
              value={phone}
              onChange={handlePhoneInput}
              className="form-control"
              placeholder="Digite seu celular"
              required
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
      {message && <div className="message-container"><p className="message">{message}</p></div>}
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
    }
  }

  label {
    margin-bottom: 5px;
    font-weight: bold;
  }

  .message-container {
    margin-top: 10px;
    background: #f8d7da;
    padding: 10px;
    border-radius: 5px;
  }

  .message {
    font-weight: bold;
    color: red; /* You can style this message as needed */
  }
`;
