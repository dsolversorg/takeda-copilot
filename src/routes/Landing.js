import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Color from 'color';
import { useDispatch, useSelector } from 'react-redux';
import breakpoints from '../utils/breakpoints';
import Header from '../components/Header';
import { landingBackgroundImage, landingBackgroundColor } from '../config';
import { createScene } from '../store/sm';

function Landing({ className }) {
  const dispatch = useDispatch();
  const history = useHistory();

  const {
    connected,
    loading,
    error,
    progress, // Supondo que este valor vem do estado do Redux
  } = useSelector(({ sm }) => (sm));

  const createSceneIfNotStarted = () => {
    if (loading === false && connected === false && error === null) {
      dispatch(createScene());
    }
  };

  useEffect(() => {
    createSceneIfNotStarted();
  }, []);

  const handleButtonClick = () => {
    if (connected || progress >= 90) {
      history.push('/takeda-copilot');
    }
  };

  return (
    <div className={className}>
      <div className="landing-wrapper">
        <Header />
        <div className="container d-flex">
          <div className="landing-container flex-grow-1">
            <div className="col-12 col-lg-6">
              <div className="row" style={{ marginBottom: '9px' }}>
                <div>
                  <h1 className="fw-bol">Sou a Katia uma Pessoa Digital Hiper-realista, criada pela Takeda, com o propósito de esclarecer dúvidas sobre a vacina da Dengue Qdenga.</h1>
                </div>
              </div>
              <div className="row">
                <div>
                  <h4 className="fw-light" style={{ marginBottom: '31px' }}>
                    Sou um especialista
                    <b> em Dengue</b>
                    ,
                    faça-me perguntas e farei meu melhor para respondê-las.
                  </h4>
                </div>
              </div>
              <div className="row" style={{ marginBottom: '14px' }}>
                <button
                  className={`button-start m-2 ${progress < 90 ? 'button--disabled' : ''}`}
                  type="button"
                  onClick={handleButtonClick}
                  disabled={progress < 90}
                >
                  Conversar com a Katia
                </button>
              </div>
              <div className="row">
                <div>
                  Acho difícil ouvi-lo quando você está em uma sala barulhenta,
                  ou quando há outras conversas acontecendo ao seu redor,
                  então fale comigo de um lugar tranquilo.
                </div>
              </div>
              <div className="col" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Landing.propTypes = {
  className: PropTypes.string.isRequired,
};

export default styled(Landing)`
  .fw-bol { font-size: 24px!important;}

  .fw-light{ font-size: 16px; }

  .gif-loading {
    width: 25px;
    height: 25px;
  }

  .fw-bol {
    font-size: 32px;
  }

  .landing-wrapper {
    min-height: 100vh;

    background: ${landingBackgroundImage ? `url(${landingBackgroundImage})` : ''} ${landingBackgroundColor ? `${landingBackgroundColor};` : ''};
    background-size: auto 50%;
    background-repeat: no-repeat;
    background-position: button top;
    z-index: 2;

    @media (min-width: ${breakpoints.lg}px) {
      background-size: 60% auto;
      background-position: right bottom;
    }
  }

  .button-start {
    border: 1px solid rgb(60, 60, 60);
    border-radius: 32px;
    padding: 16px 32px;
    background-color: #8AC43F;
    color: #ffffff;
    font-weight: 600;
    margin: 0;
  }

  .button--disabled {
    background-color: #E5E5E5;
    color: #ABABAB;
    cursor: not-allowed;
  }

  .container {
    @media (min-width: ${breakpoints.lg}px) {
      margin-left: 70px;
    }
  }

  .landing-container {
    padding-top: 1rem;
    display: flex;

    &>div {
      background-color: ${Color(landingBackgroundColor).alpha(0.5)};
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0,0,0,0.1);
      padding: 1rem;
      border-radius: 5px;

      @media (min-width: ${breakpoints.lg}px) {
        border: none;
      }
    }
  }
`;
