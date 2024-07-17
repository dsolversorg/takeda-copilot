import React, { createRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import PersonaVideo from '../components/PersonaVideo';
import Captions from '../components/Captions';
import ContentCardDisplay from '../components/ContentCardDisplay';
import {
  disconnect, setVideoDimensions,
} from '../store/sm/index';
import Header from '../components/Header';
import {
  disconnectPage, disconnectRoute,
} from '../config';
import TextInput from '../components/TextInput';
import STTFeedback from '../components/STTFeedback';
import Controls from '../components/Controls';

function DPChat({
  className,
}) {
  const {
    connected,
    loading,
    disconnected,
    error,
    showTranscript,
    micOn,
    isOutputMuted,
  } = useSelector(({ sm }) => ({ ...sm }));
  const { pathname } = useLocation();

  const dispatch = useDispatch();

  const history = useHistory();

  if (disconnected === true) {
    if (disconnectPage) {
      history.push(disconnectRoute);
    } else history.push('/');
  } else if (error !== null) history.push('/loading?error=true');
  // usually this will be triggered when the user refreshes
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
    // run resize once on mount, then add listener for future resize events
    handleResize();
    window.addEventListener('resize', handleResize);
    // run cleanup on unmount
    return () => cleanup();
  }, []);

  window.onbeforeunload = () => {
    console.log('cleaning up');
    cleanup();
  };

  // content card display is dependent on remaining space between header and footer
  // there might be a better way to do this w/ flexbox
  const ccDisplaRef = createRef();
  const [ccDisplayHeight, setCCDisplayHeight] = useState('auto');
  useEffect(() => {
    setCCDisplayHeight(ccDisplaRef.current.clientHeight);
  }, [ccDisplaRef]);

  return (
    <div className={className}>
      <div className="video-overlay">
        {/* top row */}
        <div className="row">
          <Header />
          {/* {
            // consumers of the template can uncomment this block if they want a camera preview
            // will need to add cameraOn to the values they get from the state
              cameraOn
                ? (
                  <div className="row d-flex justify-content-end">
                    <div className="col-auto">
                      <div className="camera-preview">
                        <CameraPreview />
                      </div>
                    </div>
                  </div>
                )
                : <div />
            } */}
        </div>
        {/* middle row */}
        <div
          className="contChat row d-flex justify-content-end align-items-center flex-grow-1 ps-3 pe-3"
          ref={ccDisplaRef}
        >
          <div className="col col-md-5 d-flex align-items-end align-items-md-center" style={{ height: `${ccDisplayHeight}px` || 'auto' }}>
            <div>
              <ContentCardDisplay />
            </div>
          </div>
        </div>
        <div>
          <TextInput />
        </div>
        {/* bottom row */}
        <div>
          {isOutputMuted ? (
            <div className="row">
              <div className="col text-center">
                <Captions />
              </div>
            </div>
          ) : null}
          <div className="row">
            <div className="d-flex justify-content-center m-2">
              <STTFeedback />
            </div>
          </div>
          <div className="row justify-content-start">
            <div className="col-md-8 col-lg-5 p-3">
              <div className={`contControl ${connected && !loading && pathname === '/takeda-copilot' ? '' : 'd-none'}`}>
                <Controls />
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

export default styled(DPChat)`
  height: 100vh;

  .video-overlay {
    overflow: hidden;
    position: absolute;
    top: 0;
    right: 0;
    left: 0;

    z-index: 10;

    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .vertical-fit-container {
    flex: 0 1 auto;
    overflow-y: scroll;

    scrollbar-width: none; /* Firefox 64 */
    &::-webkit-scrollbar {
      display: none;
    }
  }

  .contChat{
    overflow-y: scroll;
  }

  .row{
    overflow-x: hiden;
    overflow-y: hiden;
    --bs-gutter-y: 0.1rem;
  }

  .contControl{
    width: 350px;
    max-width: 100%;
  }
`;
