import React, { createRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {
  ChatSquareTextFill,
  X,
  TelephoneFill,
} from 'react-bootstrap-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import PersonaVideo from '../components/PersonaVideo';
import Captions from '../components/Captions';
import ContentCardDisplay from '../components/ContentCardDisplay';
import {
  disconnect, setVideoDimensions, setShowTranscript, setMicOn,
} from '../store/sm/index';
import Header from '../components/Header';
import {
  disconnectPage, disconnectRoute,
} from '../config';
import TextInput from '../components/TextInput';
import STTFeedback from '../components/STTFeedback';
import Controls from '../components/Controls';
import { seconderyAccent } from '../globalStyle';
import PhoneForm from '../components/Call';

function DPChat({
  className,
}) {
  const {
    connected,
    loading,
    disconnected,
    error,
    isOutputMuted,
    showTranscript,
    highlightChat,
  } = useSelector(({ sm }) => ({ ...sm }));
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const history = useHistory();
  const MenuiconSize = 35;
  const [showPhoneForm, setShowPhoneForm] = useState(false);

  const toggleKeyboardInput = () => {
    dispatch(setShowTranscript(!showTranscript));
    dispatch(setMicOn({ micOn: showTranscript }));
    if (!showTranscript) {
      setShowPhoneForm(false);
    }
  };

  const togglePhoneForm = () => {
    setShowPhoneForm(!showPhoneForm);
    if (!showPhoneForm) {
      dispatch(setShowTranscript(false));
    }
  };

  if (disconnected === true) {
    if (disconnectPage) {
      history.push(disconnectRoute);
    } else history.push('/');
  } else if (error !== null) history.push('/loading?error=true');
  else if (connected !== true) history.push('/');

  const handleResize = () => {
    if (connected) {
      dispatch(setVideoDimensions({
        videoWidth: window.innerWidth,
        videoHeight: window.innerHeight,
      }));
    }
  };

  const [startedAt] = useState(Date.now());
  const cleanup = () => {
    if (Date.now() - startedAt < 1000) {
      console.warn('cleanup function invoked less than 1 second after component mounted, ignoring!');
    } else {
      console.log('cleanup function invoked!');
      window.removeEventListener('resize', handleResize);
      if (connected === true && loading === false) dispatch(disconnect());
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => cleanup();
  }, []);

  window.onbeforeunload = () => {
    console.log('cleaning up');
    cleanup();
  };

  const ccDisplaRef = createRef();
  const [ccDisplayHeight, setCCDisplayHeight] = useState('auto');
  useEffect(() => {
    setCCDisplayHeight(ccDisplaRef.current.clientHeight);
  }, [ccDisplaRef]);

  return (
    <div className={className}>
      <div className="video-overlay">
        <div className="row">
          <Header />
        </div>
        <div
          className="contChat row d-flex justify-content-end align-items-center flex-grow-1 ps-3 pe-3"
          ref={ccDisplaRef}
        >
          <div className="col col-md-5 d-flex align-items-end align-items-md-center" style={{ height: `${ccDisplayHeight}px` }}>
            <div className="chat">
              <ContentCardDisplay />
            </div>
          </div>
        </div>
        <div className="form-container">
          {showTranscript ? (
            <div className="transcript-form">
              <TextInput />
            </div>
          ) : null}
          {showPhoneForm ? (
            <div className="phone-form">
              <PhoneForm />
            </div>
          ) : null}
        </div>
        <div className="contBottom">
          {isOutputMuted ? (
            <div className="row">
              <div className="col text-center">
                <Captions />
              </div>
            </div>
          ) : null}
          <div className="row">
            <div className="d-flex justify-content-center m-2 legend">
              <STTFeedback />
            </div>
          </div>
          <div className="justify-content-between align-items-center contWid">
            <div className="d-flex justify-content-center align-items-center">
              <div className={`contControl ${connected && !loading && pathname === '/takeda-copilot' ? '' : 'd-none'}`}>
                <Controls />
              </div>
            </div>
            <div />
            <div className="endCont">
              <div className="d-flex button-container">
                {!showTranscript ? (
                  <button
                    type="button"
                    className="control-icon icon"
                    aria-label="Alternar Transcrição"
                    data-tip="Alternar Transcrição"
                    onClick={toggleKeyboardInput}
                  >
                    <ChatSquareTextFill
                      size={MenuiconSize}
                      color={seconderyAccent}
                      className="size"
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="control-icon iconMute"
                    aria-label="Alternar Transcrição"
                    data-tip="Alternar Transcrição"
                    onClick={toggleKeyboardInput}
                  >
                    <X size={MenuiconSize} className="size" color={seconderyAccent} style={{ border: highlightChat ? 'red 2px solid' : '' }} />
                  </button>
                )}
                {/* Espaçamento entre os botões */}
                <div style={{ width: '10px' }} />
                <button
                  type="button"
                  className="control-icon iconPhone"
                  aria-label="Telefone"
                  data-tip="Telefone"
                  onClick={togglePhoneForm}
                >
                  <TelephoneFill
                    size={MenuiconSize}
                    color={seconderyAccent}
                    className="size"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {connected ? <PersonaVideo /> : null}
    </div>
  );
}

DPChat.propTypes = {
  className: PropTypes.string.isRequired,
};

const getBottomValue = () => {
  if (/Android/i.test(navigator.userAgent)) {
    return '30px';
  }
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    return '80px';
  }
  return '25px';
};

export default styled(DPChat)`
  .fw-bol { font-size: 24px!important;}
  height: 100vh;
  .endCont .row>* {
    width: 0;
  }
  .video-overlay {
    overflow: hidden;
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: 10;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .endCont{
    width: 90px;
    display: flex;
    justify-content: center;
    flex-direction: row;
  }
  .button-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  .vertical-fit-container {
    flex: 0 1 auto;
    overflow-y: scroll;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
  .legend{
    @media (max-width: 500px){
      align-items: center;
      word-break: break-word;
    }
  }
  .contChat{
    overflow-y: scroll;
    @media (max-width: 500px){
      word-break: break-word;
    }
  }
  .fw-bol {
    font-size: 32px;
  }
  .row{
    overflow-x: hidden;
    overflow-y: hidden;
    --bs-gutter-y: 0.2rem;
  }
  .contControl{
    width: 100%;
  }
  .contBottom{
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    position: relative;
    bottom: ${getBottomValue()};
  }
  
  .contWid{
    display: flex;
    width: 90%;
    margin-bottom: 20px;
    margin-top: 20px;
  }
  .control-icon {
    border: none;
    background: none;
    padding: .4rem;
  }
  .iconMute{
    background-color: #f2695c;
    border-radius: 40px;
    padding: 1rem;
    height: 70px;
    width: 70px;
    &:hover{
      background-color: #bc493e;
    }
    @media (max-width: 500px){
      height: 60px;
      width: 60px;
    }
  }
  .iconPhone{
    background-color: #4caf50;
    border-radius: 40px;
    padding: 1rem;
    height: 70px;
    width: 70px;
    &:hover{
      background-color: #388e3c;
    }
    @media (max-width: 500px){
      height: 60px;
      width: 60px;
    }
  }
  .chat{
    width: 100%;
  }
  .size{
    @media (max-width: 500px){
      width: 20px !important;
      height: 20px !important;
    }
  }
  .col-md-5{
    position: relative;
    top: 200px;
    
    @media (max-width: 500px){
      position: relative;
      top: 0;
    }
  }
  .form-container {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  .transcript-form {
    flex: 1;
    margin-right: 10px;
  }
  .phone-form {
    flex: 1;
    margin-left: 10px;
  }
`;
