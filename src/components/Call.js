import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Send } from 'react-bootstrap-icons';
import { useDispatch } from 'react-redux';
// import { sendTextMessage } from '../store/sm';

function PhoneForm({ className }) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');

  const handleNameInput = (e) => setName(e.target.value);
  const handleCompanyInput = (e) => setCompany(e.target.value);
  const handlePhoneInput = (e) => setPhone(e.target.value);

  const dispatch = useDispatch();
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ name, company, phone });
    setName('');
    setCompany('');
    setPhone('');
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="formCont">
        <div className="input-group">
          <label htmlFor="name">Nome</label>
          <input
            id="name"
            value={name}
            onChange={handleNameInput}
            className="form-control"
            placeholder="Digite seu nome"
          />
        </div>
        <div className="input-group">
          <label htmlFor="company">Empresa</label>
          <input
            id="company"
            value={company}
            onChange={handleCompanyInput}
            className="form-control"
            placeholder="Digite sua empresa"
          />
        </div>
        <div className="input-group">
          <label htmlFor="phone">Celular</label>
          <input
            id="phone"
            value={phone}
            onChange={handlePhoneInput}
            className="form-control"
            placeholder="Digite seu celular"
          />
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
    flex-direction: column;
    align-items: center;
    width: 50%;

    @media (max-width: 700px){
      width: 90%;
    }
  }

  label {
    margin-bottom: 5px;
    font-weight: bold;
  }
`;
